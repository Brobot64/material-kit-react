import { CONFIG } from 'src/config-global';

import { JwtVerifyOtpView } from 'src/sections/auth/jwt-verify-otp-view';

// ----------------------------------------------------------------------

export default function VerifyOtpPage() {
  return (
    <>
      <title> {`Verify OTP - ${CONFIG.appName}`}</title>
      <JwtVerifyOtpView />
    </>
  );
}
