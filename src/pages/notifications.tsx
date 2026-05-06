import { Helmet } from 'react-helmet-async';

import { NotificationsView } from 'src/sections/notification/view/notifications-view';

// ----------------------------------------------------------------------

export default function NotificationsPage() {
  return (
    <>
      <Helmet>
        <title>Notifications</title>
      </Helmet>
      <NotificationsView />
    </>
  );
}
