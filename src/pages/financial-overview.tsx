import { CONFIG } from 'src/config-global';

import { FinancialOverviewView } from 'src/sections/financial/view/financial-overview-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Financial Overview - ${CONFIG.appName}`}</title>

      <FinancialOverviewView />
    </>
  );
}
