const PLATFORM_SESSION_KEY = 'platformAdminSession';
const IMPERSONATION_META_KEY = 'platformImpersonationMeta';

export type PlatformSessionSnapshot = {
  accessToken: string;
  user: unknown;
  appData: unknown;
};

export type ImpersonationMeta = {
  businessId: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
};

export function savePlatformSession(snapshot: PlatformSessionSnapshot) {
  sessionStorage.setItem(PLATFORM_SESSION_KEY, JSON.stringify(snapshot));
}

export function loadPlatformSession(): PlatformSessionSnapshot | null {
  const raw = sessionStorage.getItem(PLATFORM_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlatformSessionSnapshot;
  } catch {
    return null;
  }
}

export function clearPlatformSession() {
  sessionStorage.removeItem(PLATFORM_SESSION_KEY);
  sessionStorage.removeItem(IMPERSONATION_META_KEY);
}

export function saveImpersonationMeta(meta: ImpersonationMeta) {
  sessionStorage.setItem(IMPERSONATION_META_KEY, JSON.stringify(meta));
}

export function loadImpersonationMeta(): ImpersonationMeta | null {
  const raw = sessionStorage.getItem(IMPERSONATION_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationMeta;
  } catch {
    return null;
  }
}

export function isImpersonatingSession(appData: any): boolean {
  return Boolean(appData?.impersonating || appData?.impersonatedBy || loadImpersonationMeta());
}
