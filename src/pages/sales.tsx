import { CONFIG } from 'src/config-global';

import { SaleView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`New Sale - ${CONFIG.appName}`}</title>
            <SaleView />
        </>
    );
}
