import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
} from 'react';

import { useAuth } from 'src/contexts/auth-context';

import { syncEngine, type SyncStatus, bootstrapOffline } from './sync-engine';
import {
  filterOfflineDocs,
  mapDocsFromPayload,
  mapProductOutletDocs,
} from './offline-catalog';

type OfflineContextType = {
  status: SyncStatus;
  syncNow: () => Promise<void>;
  listDocs: (collection: string) => Promise<Record<string, unknown>[]>;
  getDoc: (collection: string, id: string) => Promise<Record<string, unknown> | null>;
  mutate: (params: {
    collection: string;
    entityId: string;
    patch: Record<string, unknown>;
    tombstone?: boolean;
  }) => Promise<unknown>;
  hydrateCatalog: () => Promise<void>;
  hydrateProducts: () => Promise<number>;
  hydrateCustomers: () => Promise<number>;
  hydrateCategories: () => Promise<number>;
  hydrateOutlets: () => Promise<number>;
  hydrateEmployees: () => Promise<number>;
  hydrateProductOutlets: (outletId: string) => Promise<number>;
  getOfflineProducts: (options?: { search?: string; limit?: number }) => Promise<Record<string, unknown>[]>;
  getOfflineCustomers: (options?: { search?: string; limit?: number }) => Promise<Record<string, unknown>[]>;
  getOfflineCategories: () => Promise<Record<string, unknown>[]>;
  getOfflineOutlets: () => Promise<Record<string, unknown>[]>;
  getOfflineEmployees: (options?: { outletId?: string; limit?: number }) => Promise<Record<string, unknown>[]>;
  getOfflineProductOutlets: (options: {
    outletId: string;
    search?: string;
    limit?: number;
  }) => Promise<Record<string, unknown>[]>;
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const idleStatus: SyncStatus = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncing: false,
  lastSyncedAt: null,
  pendingOps: 0,
  lastError: null,
};

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { accessToken, appData, isAuthenticated, outlets } = useAuth();
  const [status, setStatus] = useState<SyncStatus>(idleStatus);
  const hydratedForBiz = useRef<string | null>(null);

  const businessId: string | null =
    appData?.businessId || appData?.business?._id || appData?.business?.id || null;
  const assignedOutletId: string | null = appData?.outletId || null;

  useEffect(() => {
    void bootstrapOffline();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !businessId) {
      syncEngine.configure({ businessId: null, token: null });
      return undefined;
    }
    syncEngine.configure({ businessId, token: accessToken });
    return undefined;
  }, [isAuthenticated, accessToken, businessId]);

  useEffect(() => syncEngine.subscribe(setStatus), []);

  const syncNow = useCallback(async () => {
    await syncEngine.sync();
  }, []);

  const listDocs = useCallback((collection: string) => syncEngine.listDocs(collection), []);
  const getDoc = useCallback(
    (collection: string, id: string) => syncEngine.getDoc(collection, id),
    []
  );
  const mutate = useCallback(
    (params: {
      collection: string;
      entityId: string;
      patch: Record<string, unknown>;
      tombstone?: boolean;
    }) => syncEngine.mutate(params),
    []
  );

  const hydrateProducts = useCallback(async () => {
    if (!businessId) return 0;
    return syncEngine.hydrateFromEdge(
      `/products?businessId=${businessId}&limit=500`,
      'products',
      mapDocsFromPayload
    );
  }, [businessId]);

  const hydrateCustomers = useCallback(async () => {
    if (!businessId) return 0;
    return syncEngine.hydrateFromEdge(
      `/customers?limit=500`,
      'customers',
      mapDocsFromPayload
    );
  }, [businessId]);

  const hydrateCategories = useCallback(async () => {
    if (!businessId) return 0;
    return syncEngine.hydrateFromEdge(
      `/categories?businessId=${businessId}`,
      'categories',
      mapDocsFromPayload
    );
  }, [businessId]);

  const hydrateOutlets = useCallback(async () => {
    if (!businessId) return 0;
    return syncEngine.hydrateFromEdge(
      `/outlets?businessId=${businessId}`,
      'outlets',
      mapDocsFromPayload
    );
  }, [businessId]);

  const hydrateEmployees = useCallback(async () => {
    if (!businessId) return 0;
    const outletQuery = assignedOutletId ? `&outletId=${assignedOutletId}` : '';
    return syncEngine.hydrateFromEdge(
      `/employees?businessId=${businessId}&limit=200${outletQuery}`,
      'employees',
      mapDocsFromPayload
    );
  }, [businessId, assignedOutletId]);

  const hydrateProductOutlets = useCallback(async (outletId: string) => {
    if (!outletId) return 0;
    return syncEngine.hydrateFromEdge(
      `/product-outlets/outlet/${outletId}?limit=500`,
      'productOutlets',
      (payload) => mapProductOutletDocs(payload, outletId)
    );
  }, []);

  const hydrateCatalog = useCallback(async () => {
    if (!businessId) return;

    await Promise.allSettled([
      hydrateCategories(),
      hydrateProducts(),
      hydrateCustomers(),
      hydrateOutlets(),
      hydrateEmployees(),
    ]);

    const outletIds = new Set<string>();
    if (assignedOutletId) outletIds.add(assignedOutletId);
    (outlets || []).forEach((outlet: any) => {
      const id = outlet?.id || outlet?._id;
      if (id) outletIds.add(String(id));
    });

    // Cap outlet stock hydrates to avoid flooding edge/origin
    const limited = Array.from(outletIds).slice(0, 5);
    await Promise.allSettled(limited.map((id) => hydrateProductOutlets(id)));
  }, [
    businessId,
    assignedOutletId,
    outlets,
    hydrateCategories,
    hydrateProducts,
    hydrateCustomers,
    hydrateOutlets,
    hydrateEmployees,
    hydrateProductOutlets,
  ]);

  const getOfflineProducts = useCallback(
    async (options?: { search?: string; limit?: number }) =>
      filterOfflineDocs(await syncEngine.listDocs('products'), {
        search: options?.search,
        limit: options?.limit,
        searchKeys: ['name', 'sku', 'barcode'],
      }),
    []
  );

  const getOfflineCustomers = useCallback(
    async (options?: { search?: string; limit?: number }) =>
      filterOfflineDocs(await syncEngine.listDocs('customers'), {
        search: options?.search,
        limit: options?.limit,
        searchKeys: ['fullName', 'phone', 'email'],
      }),
    []
  );

  const getOfflineCategories = useCallback(
    async () => syncEngine.listDocs('categories'),
    []
  );

  const getOfflineOutlets = useCallback(async () => syncEngine.listDocs('outlets'), []);

  const getOfflineEmployees = useCallback(
    async (options?: { outletId?: string; limit?: number }) =>
      filterOfflineDocs(await syncEngine.listDocs('employees'), {
        outletId: options?.outletId,
        limit: options?.limit,
      }),
    []
  );

  const getOfflineProductOutlets = useCallback(
    async (options: { outletId: string; search?: string; limit?: number }) =>
      filterOfflineDocs(await syncEngine.listDocs('productOutlets'), {
        outletId: options.outletId,
        search: options.search,
        limit: options.limit,
        searchKeys: ['name', 'sku'],
      }),
    []
  );

  // Initial hydrate once per business when authenticated + online
  useEffect(() => {
    if (!isAuthenticated || !businessId || !status.online) return;
    if (hydratedForBiz.current === businessId) return;
    hydratedForBiz.current = businessId;
    void (async () => {
      try {
        await hydrateCatalog();
      } catch {
        // Edge/origin may be down — Dexie still serves prior cache
        hydratedForBiz.current = null;
      }
    })();
  }, [isAuthenticated, businessId, status.online, hydrateCatalog]);

  // Re-hydrate product outlets when outlet list becomes available after first pass
  useEffect(() => {
    if (!isAuthenticated || !businessId || !status.online) return;
    if (!outlets?.length) return;
    if (hydratedForBiz.current !== businessId) return;

    const outletIds = (outlets || [])
      .map((outlet: any) => String(outlet?.id || outlet?._id || ''))
      .filter(Boolean)
      .slice(0, 5);

    void Promise.allSettled(outletIds.map((id: string) => hydrateProductOutlets(id)));
  }, [isAuthenticated, businessId, status.online, outlets, hydrateProductOutlets]);

  const value = useMemo(
    () => ({
      status,
      syncNow,
      listDocs,
      getDoc,
      mutate,
      hydrateCatalog,
      hydrateProducts,
      hydrateCustomers,
      hydrateCategories,
      hydrateOutlets,
      hydrateEmployees,
      hydrateProductOutlets,
      getOfflineProducts,
      getOfflineCustomers,
      getOfflineCategories,
      getOfflineOutlets,
      getOfflineEmployees,
      getOfflineProductOutlets,
    }),
    [
      status,
      syncNow,
      listDocs,
      getDoc,
      mutate,
      hydrateCatalog,
      hydrateProducts,
      hydrateCustomers,
      hydrateCategories,
      hydrateOutlets,
      hydrateEmployees,
      hydrateProductOutlets,
      getOfflineProducts,
      getOfflineCustomers,
      getOfflineCategories,
      getOfflineOutlets,
      getOfflineEmployees,
      getOfflineProductOutlets,
    ]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
