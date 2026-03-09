import { Helmet } from 'src/components/helmet';

import { SubscriptionSuccessView } from 'src/sections/subscription/view/subscription-success-view';

// ----------------------------------------------------------------------

export default function SubscriptionSuccessPage() {
  return (
    <>
      <Helmet title="Payment Success | Tajarah" />
      <SubscriptionSuccessView />
    </>
  );
}
