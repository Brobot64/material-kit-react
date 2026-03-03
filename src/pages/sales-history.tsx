import { CONFIG } from 'src/config-global';

import { SaleHistoryView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Sales History - ${CONFIG.appName}`}</title>
            <SaleHistoryView />
        </>
    );
}
