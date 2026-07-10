import { tick, receive, type HLC, createHLC } from './crdt/hlc';
import { db, docKey, getMeta, saveHLC, setMeta, getStoredHLC, getOrCreateDeviceId } from './db';
import {
  applyOp,
  materialize,
  type SyncOp,
  opsFromPatch,
  mergeEntities,
  type SyncEntity,
} from './crdt/lww-map';

const SYNC_BASE = import.meta.env.VITE_SYNC_URL || 'http://localhost:8787';

export type SyncStatus = {
  online: boolean;
  syncing: boolean;
  lastSyncedAt: number | null;
  pendingOps: number;
  lastError: string | null;
};

type SyncListeners = Set<(status: SyncStatus) => void>;

function makeOpId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Offline-first sync engine:
 * 1. Mutations write LWW ops to Dexie outbox + local entities
 * 2. On online, push outbox → Cloudflare Worker DO
 * 3. Pull remote ops since cursor and merge locally
 * 4. Optional: hydrate catalog via edge-cache proxy
 */
export class SyncEngine {
  private businessId: string | null = null;
  private token: string | null = null;
  private syncing = false;
  private lastError: string | null = null;
  private lastSyncedAt: number | null = null;
  private listeners: SyncListeners = new Set();
  private online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private boundOnline = () => this.onConnectivityChange(true);
  private boundOffline = () => this.onConnectivityChange(false);
  private periodicTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.boundOnline);
      window.addEventListener('offline', this.boundOffline);
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.boundOnline);
      window.removeEventListener('offline', this.boundOffline);
    }
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }
    this.listeners.clear();
  }

  configure(params: { businessId: string | null; token: string | null }) {
    this.businessId = params.businessId;
    this.token = params.token;
    void this.emitStatus();
    if (this.businessId && this.token && this.online) {
      void this.sync();
    }
    this.ensurePeriodicSync();
  }

  private ensurePeriodicSync() {
    if (typeof window === 'undefined' || this.periodicTimer) return;
    // Flush pending outbox while online (covers missed `online` events)
    this.periodicTimer = setInterval(() => {
      if (this.online && this.businessId && this.token) {
        void this.sync();
      }
    }, 45_000);
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    void this.getStatus().then(listener);
    return () => this.listeners.delete(listener);
  }

  async getStatus(): Promise<SyncStatus> {
    const pendingOps = await db.outbox.where('status').anyOf(['pending', 'failed', 'syncing']).count();
    return {
      online: this.online,
      syncing: this.syncing,
      lastSyncedAt: this.lastSyncedAt,
      pendingOps,
      lastError: this.lastError,
    };
  }

  private async emitStatus() {
    const status = await this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  private onConnectivityChange(online: boolean) {
    this.online = online;
    void this.emitStatus();
    if (online) {
      // Immediate sync, then one retry for flaky reconnects
      void this.sync();
      window.setTimeout(() => {
        if (this.online) void this.sync();
      }, 2500);
    }
  }

  /** Apply a local document patch (offline-capable). */
  async mutate(params: {
    collection: string;
    entityId: string;
    patch: Record<string, unknown>;
    tombstone?: boolean;
    /** When true, do not trigger an immediate sync (avoids flush recursion). */
    skipSync?: boolean;
  }): Promise<SyncEntity> {
    if (!this.businessId) throw new Error('SyncEngine: businessId not configured');

    const deviceId = await getOrCreateDeviceId();
    let clock = await getStoredHLC(deviceId);

    const ops: SyncOp[] = [];
    if (params.tombstone) {
      clock = tick(clock);
      ops.push({
        opId: makeOpId(),
        entityId: params.entityId,
        collection: params.collection,
        businessId: this.businessId,
        field: '__deleted',
        value: true,
        clock,
        tombstone: true,
      });
    } else {
      const patchOps = opsFromPatch({
        entityId: params.entityId,
        collection: params.collection,
        businessId: this.businessId,
        patch: params.patch,
        clockForField: () => {
          clock = tick(clock);
          return clock;
        },
        makeOpId,
      });
      ops.push(...patchOps);
    }

    await saveHLC(clock);

    let entity = (await db.entities.get(params.entityId)) ?? null;
    for (const op of ops) {
      entity = applyOp(entity, op);
      await db.outbox.put({
        ...op,
        createdAt: Date.now(),
        status: 'pending',
        attempts: 0,
      });
    }

    if (!entity) throw new Error('Failed to apply ops');
    await db.entities.put(entity);

    const doc = materialize(entity);
    if (doc) {
      await db.docs.put({
        key: docKey(params.collection, params.entityId),
        collection: params.collection,
        id: params.entityId,
        businessId: this.businessId,
        doc,
        updatedAt: entity.updatedAt,
      });
    } else {
      await db.docs.delete(docKey(params.collection, params.entityId));
    }

    void this.emitStatus();
    if (this.online && !params.skipSync) void this.sync();
    return entity;
  }

  /** Read materialized docs for a collection (offline). */
  async listDocs(collection: string): Promise<Record<string, unknown>[]> {
    if (!this.businessId) return [];
    const rows = await db.docs.where({ collection, businessId: this.businessId }).toArray();
    return rows.map((r) => r.doc);
  }

  async getDoc(collection: string, id: string): Promise<Record<string, unknown> | null> {
    const row = await db.docs.get(docKey(collection, id));
    return row?.doc ?? null;
  }

  /** Full sync: push outbox then pull remote ops. */
  async sync(): Promise<void> {
    if (!this.businessId || !this.token || this.syncing || !this.online) return;

    this.syncing = true;
    this.lastError = null;
    await this.emitStatus();

    try {
      await this.flushPendingSalesToOrigin();
      await this.pushOutbox();
      await this.pullRemote();
      this.lastSyncedAt = Date.now();
      await setMeta('lastSyncedAt', this.lastSyncedAt);
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : 'Sync failed';
      console.error('[SyncEngine]', this.lastError);
    } finally {
      this.syncing = false;
      await this.emitStatus();
    }
  }

  /**
   * Commit locally queued sales to Express (authoritative).
   * Uses clientSaleId for idempotency when the API supports it.
   */
  private async flushPendingSalesToOrigin(): Promise<void> {
    if (!this.businessId || !this.token) return;

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';
    const pendingSales = (await this.listDocs('sales')).filter(
      (doc) => doc._pending === true || doc.status === 'pending_sync'
    );

    for (const sale of pendingSales) {
      const clientSaleId = String(sale.clientSaleId || sale.id || '');
      if (!clientSaleId) continue;

      try {
        const res = await fetch(`${apiBase}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            businessId: sale.businessId || this.businessId,
            outletId: sale.outletId,
            items: sale.items,
            paymentMethod: sale.paymentMethod,
            amountPaid: sale.amountPaid,
            customerId: sale.customerId,
            notes: sale.notes,
            clientSaleId,
          }),
        });

        if (!res.ok && res.status !== 409) {
          // 409 = already committed; treat as success
          const text = await res.text().catch(() => '');
          throw new Error(`Sale flush failed: ${res.status} ${text}`);
        }

        const payload = res.ok ? await res.json().catch(() => ({})) : {};
        const serverId = String((payload as any)?._id || (payload as any)?.data?._id || clientSaleId);

        await this.mutate({
          collection: 'sales',
          entityId: clientSaleId,
          patch: {
            ...sale,
            _pending: false,
            status: 'synced',
            serverSaleId: serverId,
            syncedAt: new Date().toISOString(),
          },
          skipSync: true,
        });
      } catch (err) {
        console.warn('[SyncEngine] pending sale flush deferred', clientSaleId, err);
      }
    }
  }

  private async authHeaders(): Promise<HeadersInit> {
    const deviceId = await getOrCreateDeviceId();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      'X-Business-Id': this.businessId ?? '',
      'X-Device-Id': deviceId,
    };
  }

  private async pushOutbox(): Promise<void> {
    const pending = await db.outbox
      .where('status')
      .anyOf(['pending', 'failed'])
      .filter((row) => row.businessId === this.businessId)
      .limit(200)
      .toArray();

    if (pending.length === 0) return;

    const deviceId = await getOrCreateDeviceId();
    for (const row of pending) {
      await db.outbox.update(row.opId, { status: 'syncing', attempts: row.attempts + 1 });
    }

    const res = await fetch(`${SYNC_BASE}/v1/sync/${this.businessId}/push`, {
      method: 'POST',
      headers: await this.authHeaders(),
      body: JSON.stringify({
        deviceId,
        ops: pending.map(({ createdAt: _c, status: _s, attempts: _a, lastError: _e, ...op }) => op),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      for (const row of pending) {
        await db.outbox.update(row.opId, { status: 'failed', lastError: text || res.statusText });
      }
      throw new Error(`Push failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as {
      accepted: string[];
      rejected: { opId: string; reason: string }[];
      serverClock: HLC;
    };

    for (const opId of data.accepted ?? []) {
      await db.outbox.update(opId, { status: 'acked' });
    }
    for (const rej of data.rejected ?? []) {
      await db.outbox.update(rej.opId, { status: 'failed', lastError: rej.reason });
    }

    // Advance local HLC from server
    let clock = await getStoredHLC(deviceId);
    clock = receive(clock, data.serverClock);
    await saveHLC(clock);

    // Prune acked outbox older than keep window
    const acked = await db.outbox.where('status').equals('acked').toArray();
    if (acked.length > 500) {
      const sorted = acked.sort((a, b) => a.createdAt - b.createdAt);
      const toDelete = sorted.slice(0, acked.length - 500);
      await db.outbox.bulkDelete(toDelete.map((r) => r.opId));
    }
  }

  private async pullRemote(): Promise<void> {
    const since = await getMeta<number>(`pullCursor:${this.businessId}`, 0);
    const collections =
      'products,customers,categories,outlets,sales,inventory,settings,productOutlets,employees';
    const url = `${SYNC_BASE}/v1/sync/${this.businessId}/pull?since=${since}&collections=${collections}`;

    const res = await fetch(url, { headers: await this.authHeaders() });
    if (!res.ok) {
      throw new Error(`Pull failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      ops: Array<SyncOp & { seq: number }>;
      serverClock: HLC;
      opSeq: number;
    };

    const deviceId = await getOrCreateDeviceId();
    let clock = await getStoredHLC(deviceId);

    for (const op of data.ops ?? []) {
      clock = receive(clock, op.clock);
      const existing = (await db.entities.get(op.entityId)) ?? null;
      const next = applyOp(existing, op);
      await db.entities.put(next);

      const doc = materialize(next);
      if (doc) {
        await db.docs.put({
          key: docKey(op.collection, op.entityId),
          collection: op.collection,
          id: op.entityId,
          businessId: op.businessId,
          doc,
          updatedAt: next.updatedAt,
        });
      } else {
        await db.docs.delete(docKey(op.collection, op.entityId));
      }
    }

    await saveHLC(clock);
    await setMeta(`pullCursor:${this.businessId}`, data.opSeq ?? since);
  }

  /**
   * Hydrate a collection from edge-cached origin GET, then seed local docs.
   * Does not create CRDT ops — used for initial cache fill.
   */
  async hydrateFromEdge(originPath: string, collection: string, mapItems: (payload: unknown) => Array<{ id: string; doc: Record<string, unknown> }>): Promise<number> {
    if (!this.businessId || !this.token) return 0;

    const url = `${SYNC_BASE}/v1/edge-cache${originPath.startsWith('/') ? originPath : `/${originPath}`}`;
    const res = await fetch(url, { headers: await this.authHeaders() });
    if (!res.ok) throw new Error(`Hydrate failed: ${res.status}`);

    const payload = await res.json();
    const items = mapItems(payload);
    const deviceId = await getOrCreateDeviceId();
    let clock = await getStoredHLC(deviceId);

    for (const item of items) {
      clock = tick(clock);
      const fields: SyncEntity['fields'] = {};
      for (const [field, value] of Object.entries(item.doc)) {
        if (field === 'id') continue;
        clock = tick(clock);
        fields[field] = { value, clock };
      }

      const entity: SyncEntity = {
        id: item.id,
        collection,
        businessId: this.businessId,
        fields,
        updatedAt: clock.wall,
      };

      const existing = await db.entities.get(item.id);
      const merged = existing ? mergeEntities(existing, entity) : entity;
      await db.entities.put(merged);

      const doc = materialize(merged);
      if (doc) {
        await db.docs.put({
          key: docKey(collection, item.id),
          collection,
          id: item.id,
          businessId: this.businessId,
          doc,
          updatedAt: merged.updatedAt,
        });
      }
    }

    await saveHLC(clock);
    return items.length;
  }
}

export const syncEngine = new SyncEngine();

/** Ensure device HLC exists on first load. */
export async function bootstrapOffline(): Promise<string> {
  const deviceId = await getOrCreateDeviceId();
  const clock = await getStoredHLC(deviceId);
  if (!clock.deviceId) {
    await saveHLC(createHLC(deviceId));
  }
  return deviceId;
}
