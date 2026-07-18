import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: Props) {
  const router = useRouter();

  const { isAuthenticated, isInitialized, user, appData, subscriptionStatus } = useAuth();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isAuthenticated) {
      setChecked(true);
      return;
    }

    // Owners renewing an expired subscription must stay on /subscription/*;
    // bouncing them to /app fights SubscriptionGuard.
    const onSubscriptionRoute = window.location.pathname.startsWith('/subscription');
    const isOwner =
      appData?.role === 'owner' ||
      appData?.role === 'system_admin' ||
      user?.role === 'admin';
    if (
      onSubscriptionRoute &&
      (subscriptionStatus.isExpired || appData?.mustRenewSubscription) &&
      isOwner
    ) {
      setChecked(true);
      return;
    }

    router.replace(user?.role === 'admin' ? '/admin' : '/app');
  }, [
    isAuthenticated,
    router,
    user?.role,
    appData?.role,
    appData?.mustRenewSubscription,
    subscriptionStatus.isExpired,
  ]);

  useEffect(() => {
    if (isInitialized) {
      check();
    }
  }, [isInitialized, check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
