import { Helmet } from 'src/components/helmet';

import { SubscriptionCancelView } from 'src/sections/subscription/view/subscription-cancel-view';

// ----------------------------------------------------------------------

export default function SubscriptionCancelPage() {
  return (
    <>
      <Helmet title="Payment Cancelled | Tajarah" />
      <SubscriptionCancelView />
    </>
  );
}
