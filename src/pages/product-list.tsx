import { Helmet } from 'src/components/helmet';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Product List"
        description="View and manage a comprehensive list of all your business products."
      />

      <ProductListView />
    </>
  );
}
