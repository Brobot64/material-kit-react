import { lazy } from 'react';

import { Helmet } from 'src/components/helmet';

const TeamDetailView = lazy(() => import('src/sections/team/view/team-detail-view'));

// ----------------------------------------------------------------------

export default function TeamDetailPage() {
  return (
    <>
      <Helmet
        title="Team Details"
        description="View team membership, roles, and collaborative projects."
      />
      <TeamDetailView />
    </>
  );
}
