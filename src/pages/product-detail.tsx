import { useParams } from 'react-router-dom';

import { Helmet } from 'src/components/helmet';
import { ProductDetailView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Helmet
        title={`Product: ${id}`}
        description={`View details for product ${id} in your Tajarah catalog.`}
      />
      <ProductDetailView id={id || ''} />
    </>
  );
}
