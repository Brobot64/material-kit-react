import { SignIn } from '@clerk/react';

import { Helmet } from 'src/components/helmet';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Sign In"
        description="Login to your Tajarah account to manage your business, outlets, and sales."
      />

      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <SignIn routing="hash" signUpUrl="/register" />
      </div>
    </>
  );
}
