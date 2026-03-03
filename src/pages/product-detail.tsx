import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ProductDetailView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <title>{`Product: ${id} - ${CONFIG.appName}`}</title>
      <ProductDetailView id={id || ''} />
    </>
  );
}
