import { SignUp } from '@clerk/react';

import { Helmet } from 'src/components/helmet';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Sign Up"
        description="Join Tajarah today. Create an account to start managing your business outlets, inventory, and sales effectively."
      />

      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <SignUp routing="hash" signInUrl="/sign-in" />
      </div>
    </>
  );
}
