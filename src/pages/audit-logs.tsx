import { Helmet } from 'src/components/helmet';

import { AuditLogsView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet
                title="Audit Trail"
                description="View and trace every recorded action across your business on Tajarah."
            />
            <AuditLogsView />
        </>
    );
}
