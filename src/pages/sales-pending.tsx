import { CONFIG } from 'src/config-global';

import { SalePendingView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Pending Payments - ${CONFIG.appName}`}</title>
            <SalePendingView />
        </>
    );
}
