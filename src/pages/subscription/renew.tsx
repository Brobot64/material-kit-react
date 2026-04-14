import { Helmet } from 'src/components/helmet';

import { SubscriptionRenewView } from 'src/sections/subscription/view/subscription-renew-view';

// ----------------------------------------------------------------------

export default function SubscriptionRenewPage() {
  return (
    <>
      <Helmet title="Renew Subscription | Tajarah" />
      <SubscriptionRenewView />
    </>
  );
}
