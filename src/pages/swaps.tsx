import { Helmet } from 'src/components/helmet';

import { SwapView } from 'src/sections/swap/view/swap-view';

// ----------------------------------------------------------------------

export default function SwapsPage() {
  return (
    <>
      <Helmet title="Swaps" description="Manage product swap transactions." />
      <SwapView />
    </>
  );
}
