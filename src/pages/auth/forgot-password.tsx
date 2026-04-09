import { Helmet } from 'src/components/helmet';

import { ForgotPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Forgot Password"
        description="Reset your account password easily. Enter your email address to receive an OTP and follow the steps to create a new, secure password."
      />

      <ForgotPasswordView />
    </>
  );
}
