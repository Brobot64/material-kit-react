import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/** TajUser.role === 'admin' only — not tenant system_admin. */
export function PlatformAdminGuard({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();
      router.replace(`/sign-in?${searchParams}`);
      return;
    }

    if (user?.role !== 'admin') {
      router.replace('/app');
      return;
    }

    setChecked(true);
  }, [isAuthenticated, isInitialized, router, user?.role]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
