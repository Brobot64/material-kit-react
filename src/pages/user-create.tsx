import { Helmet } from 'src/components/helmet';
import { UserCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Create User"
        description="Add new team members and assign roles to your Tajarah business account."
      />

      <UserCreateView />
    </>
  );
}
