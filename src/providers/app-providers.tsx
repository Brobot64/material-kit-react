import { type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { SocketProvider } from 'src/contexts/socket-context';
import { useAuth, AuthProvider } from 'src/contexts/auth-context';
import { NotificationProvider } from 'src/contexts/notification-context';

// ----------------------------------------------------------------------

type AppProvidersProps = {
  children: ReactNode;
};

function InnerProviders({ children }: AppProvidersProps) {
  const { appData } = useAuth();

  return (
    <SocketProvider businessId={appData?.businessId ?? null}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SocketProvider>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <InnerProviders>{children}</InnerProviders>
      </AuthProvider>
    </HelmetProvider>
  );
}
