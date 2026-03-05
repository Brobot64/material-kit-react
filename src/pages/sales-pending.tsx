import { Helmet } from 'src/components/helmet';

import { SalePendingView } from 'src/sections/sale/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet
                title="Pending Payments"
                description="Keep track of pending sales payments and credit accounts on Tajarah."
            />
            <SalePendingView />
        </>
    );
}
