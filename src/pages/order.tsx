import { Helmet } from 'src/components/helmet';

import { OrderView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Orders"
        description="Track and manage customer orders and fulfillment on Tajarah."
      />

      <OrderView />
    </>
  );
}
