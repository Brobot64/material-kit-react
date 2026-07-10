import { syncEngine } from './sync-engine';
import { filterOfflineDocs } from './offline-catalog';

/**
 * Direct Dexie reads for places that cannot use useOffline()
 * (e.g. AuthContext, which sits above OfflineProvider).
 */
export async function readOfflineCollection(
  collection: string,
  options?: { search?: string; outletId?: string; limit?: number; searchKeys?: string[] }
): Promise<Record<string, unknown>[]> {
  const docs = await syncEngine.listDocs(collection);
  return filterOfflineDocs(docs, options);
}
