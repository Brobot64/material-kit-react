import { CONFIG } from 'src/config-global';

import { CategoriesView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Categories - ${CONFIG.appName}`}</title>
      <CategoriesView />
    </>
  );
}
