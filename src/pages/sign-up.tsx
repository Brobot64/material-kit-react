import { Helmet } from 'src/components/helmet';
import { SignUpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Sign Up"
        description="Join Tajarah today. Create an account to start managing your business outlets, inventory, and sales effectively."
      />

      <SignUpView />
    </>
  );
}
