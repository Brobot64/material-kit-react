import { Helmet } from 'src/components/helmet';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="404 Page Not Found"
        description="The page you are looking for does not exist on Tajarah."
      />

      <NotFoundView />
    </>
  );
}
