import type { BusinessSettings } from 'src/types/business-settings';

import { useState, useEffect } from 'react';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';

const CACHE_KEY = 'businessSettings';

export function useBusinessSettings() {
  const { appData, isAuthenticated } = useAuth();
  const businessId = appData?.businessId;

  const [settings, setSettings] = useState<BusinessSettings | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !businessId) return undefined;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const data = await api.getBusinessSettings(businessId);
        if (!cancelled) {
          setSettings(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      } catch { /* silently fallback to defaults */ }
      finally { if (!cancelled) setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, businessId]);

  const refresh = async () => {
    if (!businessId) return;
    try {
      const data = await api.getBusinessSettings(businessId);
      setSettings(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  };

  return { settings, loading, refresh };
}
