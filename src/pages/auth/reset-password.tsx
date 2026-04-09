import { Helmet } from 'src/components/helmet';

import { ResetPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Reset Password"
        description="Securely reset your account password. Enter the OTP sent to your email and choose a new password to regain access to your account."
      />

      <ResetPasswordView />
    </>
  );
}
