import { Helmet } from 'src/components/helmet';
import { _posts } from 'src/_mock';
import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet
        title="Blog"
        description="Stay updated with the latest business insights, tips, and Tajarah platform updates."
      />

      <BlogView posts={_posts} />
    </>
  );
}
