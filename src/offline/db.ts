import Dexie, { type Table } from 'dexie';

import type { HLC } from './crdt/hlc';
import type { SyncOp, SyncEntity } from './crdt/lww-map';

export type SyncMeta = {
  key: string;
  value: unknown;
};

export type OutboxRow = SyncOp & {
  createdAt: number;
  status: 'pending' | 'syncing' | 'acked' | 'failed';
  attempts: number;
  lastError?: string;
};

export type CachedDoc = {
  /** `${collection}:${id}` */
  key: string;
  collection: string;
  id: string;
  businessId: string;
  doc: Record<string, unknown>;
  updatedAt: number;
};

export type SyncCollection =
  | 'products'
  | 'customers'
  | 'categories'
  | 'outlets'
  | 'sales'
  | 'inventory'
  | 'settings'
  | 'productOutlets'
  | 'employees';

/**
 * IndexedDB via Dexie — local source of truth while offline.
 * entities: CRDT LWW-Map snapshots
 * outbox: ops waiting to push to Cloudflare Sync Worker
 * docs: materialized JSON for fast UI reads
 * meta: deviceId, HLC, pull cursor
 */
export class ShopMasterDB extends Dexie {
  entities!: Table<SyncEntity, string>;
  outbox!: Table<OutboxRow, string>;
  docs!: Table<CachedDoc, string>;
  meta!: Table<SyncMeta, string>;

  constructor() {
    super('shopmaster-offline');
    this.version(1).stores({
      entities: 'id, collection, businessId, updatedAt',
      outbox: 'opId, status, businessId, createdAt, entityId',
      docs: 'key, collection, businessId, updatedAt',
      meta: 'key',
    });
  }
}

export const db = new ShopMasterDB();

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await db.meta.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getMeta<string | null>('deviceId', null);
  if (existing) return existing;
  const deviceId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await setMeta('deviceId', deviceId);
  return deviceId;
}

export async function getStoredHLC(deviceId: string): Promise<HLC> {
  const stored = await getMeta<HLC | null>('hlc', null);
  if (stored) return { ...stored, deviceId };
  return { wall: Date.now(), logical: 0, deviceId };
}

export async function saveHLC(clock: HLC): Promise<void> {
  await setMeta('hlc', clock);
}

export function docKey(collection: string, id: string): string {
  return `${collection}:${id}`;
}
