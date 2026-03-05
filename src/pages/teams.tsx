import { lazy } from 'react';

import { Helmet } from 'src/components/helmet';

const TeamsView = lazy(() => import('src/sections/team/view/teams-view'));

// ----------------------------------------------------------------------

export default function TeamsPage() {
  return (
    <>
      <Helmet
        title="Teams"
        description="Collaborate with your team members and manage business units on Tajarah."
      />
      <TeamsView />
    </>
  );
}
