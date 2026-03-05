import { lazy } from 'react';

import { Helmet } from 'src/components/helmet';

const ProjectsView = lazy(() => import('src/sections/project/view/projects-view'));

// ----------------------------------------------------------------------

export default function ProjectsPage() {
  return (
    <>
      <Helmet
        title="Projects"
        description="Manage your business projects, tasks, and timelines efficiently on Tajarah."
      />
      <ProjectsView />
    </>
  );
}
