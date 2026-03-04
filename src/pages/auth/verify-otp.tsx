import { Helmet } from 'src/components/helmet';
import { JwtVerifyOtpView } from 'src/sections/auth/jwt-verify-otp-view';

// ----------------------------------------------------------------------

export default function VerifyOtpPage() {
  return (
    <>
      <Helmet
        title="Verify OTP"
        description="Verify your account to complete registration on Tajarah."
      />
      <JwtVerifyOtpView />
    </>
  );
}
