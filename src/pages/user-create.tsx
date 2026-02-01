import { CONFIG } from 'src/config-global';

import { UserCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create user - ${CONFIG.appName}`}</title>

      <UserCreateView />
    </>
  );
}
