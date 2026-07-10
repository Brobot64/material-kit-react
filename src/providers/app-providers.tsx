import { type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { SocketProvider } from 'src/contexts/socket-context';
import { OfflineProvider } from 'src/offline/offline-context';
import { useAuth, AuthProvider } from 'src/contexts/auth-context';
import { NotificationProvider } from 'src/contexts/notification-context';

// ----------------------------------------------------------------------

type AppProvidersProps = {
  children: ReactNode;
};

function InnerProviders({ children }: AppProvidersProps) {
  const { accessToken } = useAuth();

  return (
    <SocketProvider token={accessToken}>
      <NotificationProvider>
        <OfflineProvider>{children}</OfflineProvider>
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
