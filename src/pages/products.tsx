import { Helmet } from 'src/components/helmet';

import { ProductsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Products"
        description="Browse and manage your business product catalog on Tajarah."
      />

      <ProductsView />
    </>
  );
}
