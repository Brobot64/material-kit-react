import { Helmet } from 'src/components/helmet';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Dashboard"
        description="Comprehensive business analytics and sales overview for Tajarah. Monitor your outlet performance and inventory in real-time."
        keywords="dashboard, analytics, sales management, tajarah business"
      />

      <DashboardView />
    </>
  );
}
