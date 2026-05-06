import { Helmet } from 'src/components/helmet';

import { BargainingAnalyticsView } from 'src/sections/financial/view/bargaining-analytics-view';

// ----------------------------------------------------------------------

export default function BargainingAnalyticsPage() {
  return (
    <>
      <Helmet title="Bargaining Analytics" description="Understand price override patterns and margin impact." />
      <BargainingAnalyticsView />
    </>
  );
}
