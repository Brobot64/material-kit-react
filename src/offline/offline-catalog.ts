import type { SyncCollection } from './db';

/** Extract a list of records from common API response shapes. */
export function extractList(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload as Array<Record<string, unknown>>;
  }
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.data,
    obj.results,
    obj.products,
    obj.customers,
    obj.categories,
    obj.outlets,
    obj.employees,
    obj.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Array<Record<string, unknown>>;
    }
  }

  return [];
}

export function mapDocsFromPayload(
  payload: unknown
): Array<{ id: string; doc: Record<string, unknown> }> {
  return extractList(payload)
    .map((item) => {
      const id = String(item._id ?? item.id ?? '');
      if (!id) return null;
      return { id, doc: { ...item, id } };
    })
    .filter(Boolean) as Array<{ id: string; doc: Record<string, unknown> }>;
}

/** Product-outlet rows often nest productId; use a stable composite id. */
export function mapProductOutletDocs(
  payload: unknown,
  outletId: string
): Array<{ id: string; doc: Record<string, unknown> }> {
  return extractList(payload)
    .map((item) => {
      const productRef = item.productId;
      const productId =
        typeof productRef === 'object' && productRef
          ? String((productRef as { _id?: string; id?: string })._id ?? (productRef as { id?: string }).id ?? '')
          : String(productRef ?? item._id ?? item.id ?? '');

      if (!productId) return null;

      const id = String(item._id ?? item.id ?? `${outletId}:${productId}`);
      const nestedProduct =
        typeof productRef === 'object' && productRef
          ? (productRef as Record<string, unknown>)
          : null;

      return {
        id,
        doc: {
          ...item,
          id,
          productId,
          outletId,
          name: item.name ?? nestedProduct?.name,
          sku: item.sku ?? nestedProduct?.sku,
          availableQuantity:
            item.availableQuantity ?? item.quantity ?? nestedProduct?.availableQuantity ?? 0,
          defaultSalePrice:
            item.defaultSalePrice ?? item.guidePrice ?? item.sellingPrice ?? nestedProduct?.defaultSalePrice ?? 0,
          guidePrice: item.guidePrice ?? nestedProduct?.guidePrice ?? 0,
          floorPrice: item.floorPrice ?? nestedProduct?.floorPrice ?? 0,
        },
      };
    })
    .filter(Boolean) as Array<{ id: string; doc: Record<string, unknown> }>;
}

export type OfflineCatalogCollection = SyncCollection | 'productOutlets' | 'employees';

export function filterOfflineDocs<T extends Record<string, unknown>>(
  docs: T[],
  options?: {
    search?: string;
    searchKeys?: string[];
    outletId?: string;
    limit?: number;
  }
): T[] {
  let result = docs;

  if (options?.outletId) {
    result = result.filter((doc) => {
      const docOutlet =
        typeof doc.outletId === 'object' && doc.outletId
          ? String((doc.outletId as { _id?: string; id?: string })._id ?? (doc.outletId as { id?: string }).id ?? '')
          : String(doc.outletId ?? '');
      return !docOutlet || docOutlet === options.outletId;
    });
  }

  if (options?.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    const keys = options.searchKeys ?? ['name', 'fullName', 'sku', 'email', 'phone', 'position'];
    result = result.filter((doc) =>
      keys.some((key) => {
        const value = doc[key];
        if (typeof value === 'string') return value.toLowerCase().includes(q);
        if (value && typeof value === 'object') {
          const nested = value as Record<string, unknown>;
          return ['fullName', 'name', 'email', 'phone'].some(
            (nestedKey) =>
              typeof nested[nestedKey] === 'string' &&
              String(nested[nestedKey]).toLowerCase().includes(q)
          );
        }
        return false;
      })
    );
  }

  if (options?.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return result;
}
