import { Helmet } from 'src/components/helmet';

import { ReturnView } from 'src/sections/return/view/return-view';

// ----------------------------------------------------------------------

export default function ReturnsPage() {
  return (
    <>
      <Helmet title="Returns & Warranty" description="Track warranty returns, distributor repairs, and customer pickups." />
      <ReturnView />
    </>
  );
}
