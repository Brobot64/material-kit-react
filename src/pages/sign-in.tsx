import { Helmet } from 'src/components/helmet';
import { SignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Sign In"
        description="Login to your Tajarah account to manage your business, outlets, and sales."
      />

      <SignInView />
    </>
  );
}
