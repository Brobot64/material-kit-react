import { Helmet } from 'src/components/helmet';
import { CategoriesView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Categories"
        description="Organize your products into categories for better inventory management."
      />
      <CategoriesView />
    </>
  );
}
