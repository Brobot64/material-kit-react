import { Helmet } from 'react-helmet-async';

import { ReceivablesView } from 'src/sections/receivable/view/receivables-view';

export default function ReceivablesPage() {
  return (
    <>
      <Helmet><title>Receivables | ShopMaster</title></Helmet>
      <ReceivablesView />
    </>
  );
}
