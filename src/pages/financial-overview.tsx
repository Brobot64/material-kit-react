import { Helmet } from 'src/components/helmet';

import { FinancialOverviewView } from 'src/sections/financial/view/financial-overview-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Financial Overview"
        description="Get a detailed overview of your business finances, income, and expenses with Tajarah."
      />

      <FinancialOverviewView />
    </>
  );
}
