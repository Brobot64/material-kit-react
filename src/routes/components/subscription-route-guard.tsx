import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * /subscription/* is for owners (and unauthenticated checkout via query params).
 * Unlike GuestGuard, logged-in owners may stay here even when the plan is still active
 * so they can renew before expiry.
 */
export function SubscriptionRouteGuard({ children }: Props) {
  const router = useRouter();

  const { isAuthenticated, isInitialized, user, appData, isImpersonating } = useAuth();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      setChecked(true);
      return;
    }

    if (isImpersonating) {
      setChecked(true);
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    const canRenew =
      appData?.role === 'owner' ||
      appData?.role === 'system_admin' ||
      appData?.canRenewSubscription;

    if (canRenew) {
      setChecked(true);
      return;
    }

    router.replace('/app');
  }, [
    isAuthenticated,
    isInitialized,
    isImpersonating,
    router,
    user?.role,
    appData?.role,
    appData?.canRenewSubscription,
  ]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
