import { Helmet } from 'react-helmet-async';

import { ReceiptTemplateView } from 'src/sections/receipt-template/view/receipt-template-view';

export default function ReceiptTemplatePage() {
  return (
    <>
      <Helmet><title>Receipt Template | ShopMaster</title></Helmet>
      <ReceiptTemplateView />
    </>
  );
}
