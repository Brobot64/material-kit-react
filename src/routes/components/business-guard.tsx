import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * Sits inside AuthGuard: an authenticated user with no active business is sent
 * to onboarding to create one.
 */
export function BusinessGuard({ children }: Props) {
  const router = useRouter();
  const { isInitialized, isAuthenticated, appData } = useAuth();
  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !appData?.businessId) {
      router.replace('/onboarding');
    } else {
      setChecked(true);
    }
  }, [isInitialized, isAuthenticated, appData?.businessId, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
