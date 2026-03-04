import { Helmet } from 'src/components/helmet';
import { CustomersView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet
                title="Customers"
                description="Manage your customer relationships and view customer insights on Tajarah."
            />
            <CustomersView />
        </>
    );
}
