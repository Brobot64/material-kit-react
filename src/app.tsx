import 'src/global.css';

import { useRef, useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { useBusinessSettings } from 'src/hooks/useBusinessSettings';

import { SnackbarProvider } from 'src/contexts/snackbar-context';
import { BusinessThemeProvider } from 'src/theme/business-theme-provider';

// ----------------------------------------------------------------------

function TitleEnhancer() {
  const { settings } = useBusinessSettings();
  const businessName = settings?.displayName;
  const modifying = useRef(false);

  useEffect(() => {
    if (!businessName) return undefined;

    const apply = () => {
      if (modifying.current) return;
      const t = document.title;
      if (t && !t.endsWith(` | ${businessName}`)) {
        modifying.current = true;
        document.title = `${t} | ${businessName}`;
        modifying.current = false;
      }
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, characterData: true, childList: true });
    return () => observer.disconnect();
  }, [businessName]);

  return null;
}

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <BusinessThemeProvider>
      <SnackbarProvider>
        <TitleEnhancer />
        {children}
      </SnackbarProvider>
    </BusinessThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
