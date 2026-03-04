import { Helmet } from 'src/components/helmet';
import { SaleView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet
                title="New Sale"
                description="Process new sales transactions quickly and efficiently with Tajarah POS."
            />
            <SaleView />
        </>
    );
}
