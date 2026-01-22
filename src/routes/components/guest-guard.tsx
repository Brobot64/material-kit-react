import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: Props) {
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  const [checked, setChecked] = useState(true);

  const check = useCallback(() => {
    if (isAuthenticated) {
      router.replace('/');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

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
