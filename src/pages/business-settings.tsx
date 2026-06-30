import { Helmet } from 'react-helmet-async';

import { BusinessSettingsView } from 'src/sections/settings/view/business-settings-view';

export default function BusinessSettingsPage() {
  return (
    <>
      <Helmet><title>Business Settings | ShopMaster</title></Helmet>
      <BusinessSettingsView />
    </>
  );
}
