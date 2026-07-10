import { it, expect, describe } from 'vitest';

import { tick, receive, createHLC, compareHLC } from './hlc';
import { applyOp, materialize, type SyncOp, mergeEntities } from './lww-map';

describe('client HLC', () => {
  it('ticks logical when wall does not advance', () => {
    const a = createHLC('device-a', 1000);
    const b = tick(a, 1000);
    expect(b.logical).toBe(1);
    expect(compareHLC(a, b)).toBeLessThan(0);
  });

  it('receive merges remote wall', () => {
    const local = createHLC('local', 10);
    const remote = createHLC('remote', 50);
    const next = receive(local, remote, 20);
    expect(next.wall).toBe(50);
  });
});

describe('client LWW-Map', () => {
  it('applies newer field write', () => {
    const op1: SyncOp = {
      opId: '1',
      entityId: 'c1',
      collection: 'customers',
      businessId: 'b1',
      field: 'name',
      value: 'Ada',
      clock: createHLC('d1', 1),
    };
    const op2: SyncOp = {
      ...op1,
      opId: '2',
      value: 'Ada Lovelace',
      clock: createHLC('d2', 2),
    };
    expect(materialize(applyOp(applyOp(null, op1), op2))?.name).toBe('Ada Lovelace');
  });

  it('merge is commutative', () => {
    const base = applyOp(null, {
      opId: '0',
      entityId: 'c1',
      collection: 'customers',
      businessId: 'b1',
      field: 'phone',
      value: '080',
      clock: createHLC('d0', 1),
    });
    const left = applyOp(base, {
      opId: 'a',
      entityId: 'c1',
      collection: 'customers',
      businessId: 'b1',
      field: 'name',
      value: 'Left',
      clock: createHLC('d1', 10),
    });
    const right = applyOp(base, {
      opId: 'b',
      entityId: 'c1',
      collection: 'customers',
      businessId: 'b1',
      field: 'email',
      value: 'a@b.c',
      clock: createHLC('d2', 11),
    });
    expect(materialize(mergeEntities(left, right))).toEqual(materialize(mergeEntities(right, left)));
  });
});
