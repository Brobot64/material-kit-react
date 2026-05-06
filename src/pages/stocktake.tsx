import { Helmet } from 'react-helmet-async';

import { StocktakeView } from 'src/sections/stocktake/view/stocktake-view';

export default function StocktakePage() {
  return (
    <>
      <Helmet><title>Stocktake | ShopMaster</title></Helmet>
      <StocktakeView />
    </>
  );
}
