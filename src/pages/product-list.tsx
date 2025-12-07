import { CONFIG } from 'src/config-global';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Product List - ${CONFIG.appName}`}</title>

      <ProductListView />
    </>
  );
}