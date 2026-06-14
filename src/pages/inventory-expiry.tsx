import { Helmet } from 'react-helmet-async';

import { ExpiryView } from 'src/sections/inventory/expiry/view/expiry-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Inventory: Expiry Management | Tajarah </title>
      </Helmet>

      <ExpiryView />
    </>
  );
}