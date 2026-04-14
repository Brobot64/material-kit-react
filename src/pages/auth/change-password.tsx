import { Helmet } from 'src/components/helmet';

import { ChangePasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Change Password"
        description="For your security, you are required to change your password during your first login. Please choose a strong and unique password to keep your account safe."
      />

      <ChangePasswordView />
    </>
  );
}
