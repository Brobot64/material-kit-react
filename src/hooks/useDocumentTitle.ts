import { useEffect } from 'react';

import { useAuth } from 'src/contexts/auth-context';

export function useDocumentTitle(pageTitle: string) {
  const { appData } = useAuth();
  const businessName = appData?.businessName || appData?.business?.name;

  useEffect(() => {
    const parts = [pageTitle, 'ShopMaster'];
    if (businessName) parts.push(businessName);
    document.title = parts.join(' | ');
    return () => {
      document.title = 'ShopMaster | Tajarah';
    };
  }, [pageTitle, businessName]);
}
