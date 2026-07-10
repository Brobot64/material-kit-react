/**
 * Hybrid Logical Clock — mirrors tajarah/workers/sync/src/crdt/hlc.ts
 */

export type HLC = {
  wall: number;
  logical: number;
  deviceId: string;
};

export function createHLC(deviceId: string, wall = Date.now()): HLC {
  return { wall, logical: 0, deviceId };
}

export function tick(local: HLC, now = Date.now()): HLC {
  if (now > local.wall) {
    return { wall: now, logical: 0, deviceId: local.deviceId };
  }
  return { wall: local.wall, logical: local.logical + 1, deviceId: local.deviceId };
}

export function receive(local: HLC, remote: HLC, now = Date.now()): HLC {
  const wall = Math.max(local.wall, remote.wall, now);
  let logical = 0;
  if (wall === local.wall && wall === remote.wall) {
    logical = Math.max(local.logical, remote.logical) + 1;
  } else if (wall === local.wall) {
    logical = local.logical + 1;
  } else if (wall === remote.wall) {
    logical = remote.logical + 1;
  }
  return { wall, logical, deviceId: local.deviceId };
}

export function compareHLC(a: HLC, b: HLC): number {
  if (a.wall !== b.wall) return a.wall < b.wall ? -1 : 1;
  if (a.logical !== b.logical) return a.logical < b.logical ? -1 : 1;
  if (a.deviceId === b.deviceId) return 0;
  return a.deviceId < b.deviceId ? -1 : 1;
}
