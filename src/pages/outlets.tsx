import { Helmet } from 'react-helmet-async';

import { OutletsView } from 'src/sections/outlet/view/outlets-view';

export default function OutletsPage() {
  return (
    <>
      <Helmet><title>Outlets | ShopMaster</title></Helmet>
      <OutletsView />
    </>
  );
}
