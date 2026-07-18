import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function SubscriptionGuard({ children }: Props) {
  const router = useRouter();

  const {
    subscriptionStatus,
    isInitialized,
    isAuthenticated,
    isImpersonating,
    appData,
  } = useAuth();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    // Platform admins viewing a tenant should not be bounced to renew.
    if (isImpersonating) {
      setChecked(true);
      return;
    }

    const isOwner =
      appData?.role === 'owner' || appData?.role === 'system_admin';

    // Only owners may enter the renew flow; staff are blocked at login.
    if (
      isAuthenticated &&
      isOwner &&
      (subscriptionStatus.isExpired || appData?.mustRenewSubscription)
    ) {
      const isSubscriptionPage = window.location.pathname.startsWith('/subscription');
      if (!isSubscriptionPage) {
        router.replace('/subscription/renew');
        return;
      }
    }

    setChecked(true);
  }, [
    isAuthenticated,
    isInitialized,
    isImpersonating,
    router,
    subscriptionStatus.isExpired,
    appData?.role,
    appData?.mustRenewSubscription,
  ]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
