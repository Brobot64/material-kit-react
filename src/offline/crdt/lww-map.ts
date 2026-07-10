import { type HLC, compareHLC } from './hlc';

export type LWWField<T = unknown> = {
  value: T;
  clock: HLC;
};

export type LWWMap = Record<string, LWWField>;

export type SyncEntity = {
  id: string;
  collection: string;
  businessId: string;
  fields: LWWMap;
  deleted?: LWWField<boolean>;
  updatedAt: number;
};

export type SyncOp = {
  opId: string;
  entityId: string;
  collection: string;
  businessId: string;
  field: string;
  value: unknown;
  clock: HLC;
  tombstone?: boolean;
};

export function setField(map: LWWMap, field: string, value: unknown, clock: HLC): LWWMap {
  const existing = map[field];
  if (existing && compareHLC(existing.clock, clock) >= 0) {
    return map;
  }
  return { ...map, [field]: { value, clock } };
}

export function mergeMaps(a: LWWMap, b: LWWMap): LWWMap {
  const out: LWWMap = { ...a };
  for (const [key, remote] of Object.entries(b)) {
    const local = out[key];
    if (!local || compareHLC(remote.clock, local.clock) > 0) {
      out[key] = remote;
    }
  }
  return out;
}

export function applyOp(entity: SyncEntity | null, op: SyncOp): SyncEntity {
  const base: SyncEntity =
    entity ??
    ({
      id: op.entityId,
      collection: op.collection,
      businessId: op.businessId,
      fields: {},
      updatedAt: op.clock.wall,
    } satisfies SyncEntity);

  if (op.field === '__deleted' || op.tombstone) {
    if (base.deleted && compareHLC(base.deleted.clock, op.clock) >= 0) {
      return base;
    }
    return {
      ...base,
      deleted: { value: Boolean(op.value), clock: op.clock },
      updatedAt: Math.max(base.updatedAt, op.clock.wall),
    };
  }

  return {
    ...base,
    fields: setField(base.fields, op.field, op.value, op.clock),
    updatedAt: Math.max(base.updatedAt, op.clock.wall),
  };
}

export function mergeEntities(a: SyncEntity, b: SyncEntity): SyncEntity {
  let deleted = a.deleted;
  if (b.deleted && (!deleted || compareHLC(b.deleted.clock, deleted.clock) > 0)) {
    deleted = b.deleted;
  }
  return {
    id: a.id,
    collection: a.collection,
    businessId: a.businessId,
    fields: mergeMaps(a.fields, b.fields),
    deleted,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
}

export function materialize(entity: SyncEntity): Record<string, unknown> | null {
  if (entity.deleted?.value) return null;
  const doc: Record<string, unknown> = { id: entity.id };
  for (const [key, field] of Object.entries(entity.fields)) {
    doc[key] = field.value;
  }
  return doc;
}

/** Build field-level ops from a plain document patch. */
export function opsFromPatch(params: {
  entityId: string;
  collection: string;
  businessId: string;
  patch: Record<string, unknown>;
  clockForField: (field: string) => HLC;
  makeOpId: () => string;
}): SyncOp[] {
  const { entityId, collection, businessId, patch, clockForField, makeOpId } = params;
  return Object.entries(patch).map(([field, value]) => ({
    opId: makeOpId(),
    entityId,
    collection,
    businessId,
    field,
    value,
    clock: clockForField(field),
  }));
}
