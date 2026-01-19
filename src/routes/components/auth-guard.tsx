import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();

  const { isAuthenticated, isInitialized, user } = useAuth();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

      const href = `/sign-in?${searchParams}`;

      router.replace(href);
    } else {
      if (user?.isActive === false) {
        router.replace('/verify-otp?email=' + user.email);
      }
      setChecked(true);
    }
  }, [isAuthenticated, isInitialized, router, user]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
