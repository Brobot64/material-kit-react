import { Helmet } from 'src/components/helmet';
import { SaleHistoryView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet
                title="Sales History"
                description="Review past sales transactions and transaction details on Tajarah."
            />
            <SaleHistoryView />
        </>
    );
}
