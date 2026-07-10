import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthGuard } from 'src/routes/components';

import { AdminLayout } from './layout/AdminLayout';
import { PlatformAdminGuard } from './guards/PlatformAdminGuard';

const OverviewPage = lazy(() => import('./pages/overview'));
const BusinessesPage = lazy(() => import('./pages/businesses'));
const BusinessDetailPage = lazy(() => import('./pages/business-detail'));
const PlansPage = lazy(() => import('./pages/plans'));
const TicketsPage = lazy(() => import('./pages/tickets'));
const TicketDetailPage = lazy(() => import('./pages/ticket-detail'));
const EmailPage = lazy(() => import('./pages/email'));
const FeatureFlagsPage = lazy(() => import('./pages/feature-flags'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const platformAdminRoutes: RouteObject = {
  path: 'admin',
  element: (
    <AuthGuard>
      <PlatformAdminGuard>
        <AdminLayout />
      </PlatformAdminGuard>
    </AuthGuard>
  ),
  children: [
    {
      element: (
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      ),
      children: [
        { index: true, element: <OverviewPage /> },
        { path: 'businesses', element: <BusinessesPage /> },
        { path: 'businesses/:id', element: <BusinessDetailPage /> },
        { path: 'plans', element: <PlansPage /> },
        { path: 'tickets', element: <TicketsPage /> },
        { path: 'tickets/:id', element: <TicketDetailPage /> },
        { path: 'email', element: <EmailPage /> },
        { path: 'feature-flags', element: <FeatureFlagsPage /> },
      ],
    },
  ],
};
