import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function SubscriptionGuard({ children }: Props) {
  const router = useRouter();

  const { subscriptionStatus, isInitialized, isAuthenticated } = useAuth();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated && subscriptionStatus.isExpired) {
      // Only redirect if we're not already on a subscription-related page
      const isSubscriptionPage = window.location.pathname.startsWith('/subscription');
      if (!isSubscriptionPage) {
        router.replace('/subscription/renew');
        return;
      }
    }
    
    setChecked(true);
  }, [isAuthenticated, isInitialized, router, subscriptionStatus.isExpired]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
