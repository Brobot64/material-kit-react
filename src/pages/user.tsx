import { Helmet } from 'src/components/helmet';
import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Users"
        description="Manage system users, roles, and permissions on Tajarah."
      />

      <UserView />
    </>
  );
}
