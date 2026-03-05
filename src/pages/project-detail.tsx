import { lazy } from 'react';

import { Helmet } from 'src/components/helmet';

const ProjectDetailView = lazy(() => import('src/sections/project/view/project-detail-view'));

// ----------------------------------------------------------------------

export default function ProjectDetailPage() {
  return (
    <>
      <Helmet
        title="Project Details"
        description="Detailed view of project tasks, milestones, and team contributions."
      />
      <ProjectDetailView />
    </>
  );
}
