import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard, GuestGuard, SubscriptionGuard } from './components';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const FinancialOverviewPage = lazy(() => import('src/pages/financial-overview'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const UserCreatePage = lazy(() => import('src/pages/user-create'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const ProductDetailPage = lazy(() => import('src/pages/product-detail'));
export const ProductListPage = lazy(() => import('src/pages/product-list'));
export const CategoriesPage = lazy(() => import('src/pages/categories'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ForgotPasswordPage = lazy(() => import('src/pages/auth/forgot-password'));
export const ResetPasswordPage = lazy(() => import('src/pages/auth/reset-password'));
export const ChangePasswordPage = lazy(() => import('src/pages/auth/change-password'));
export const VerifyOtpPage = lazy(() => import('src/pages/auth/verify-otp'));
export const SubscriptionRenewPage = lazy(() => import('src/pages/subscription/renew'));
export const SubscriptionSuccessPage = lazy(() => import('src/pages/subscription/success'));
export const SubscriptionCancelPage = lazy(() => import('src/pages/subscription/cancel'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const TeamsPage = lazy(() => import('src/pages/teams'));
export const TeamDetailPage = lazy(() => import('src/pages/team-detail'));
export const ProjectsPage = lazy(() => import('src/pages/projects'));
export const ProjectDetailPage = lazy(() => import('src/pages/project-detail'));
export const ChatPage = lazy(() => import('src/pages/chat'));
export const OrderPage = lazy(() => import('src/pages/order'));
export const SalesPage = lazy(() => import('src/pages/sales'));
export const SalesHistoryPage = lazy(() => import('src/pages/sales-history'));
export const SalesPendingPage = lazy(() => import('src/pages/sales-pending'));
export const CustomersPage = lazy(() => import('src/pages/customers'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const HomePage = lazy(() => import('src/pages/home-page'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
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

export const routesSection: RouteObject[] = [
  {
    element: (
      <AuthGuard>
        <SubscriptionGuard>
          <DashboardLayout>
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </SubscriptionGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'financial-overview', element: <FinancialOverviewPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'teams/:id', element: <TeamDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'user/create', element: <UserCreatePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'product-list', element: <ProductListPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'orders', element: <OrderPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'sales/history', element: <SalesHistoryPage /> },
      { path: 'sales/pending', element: <SalesPendingPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'subscription',
    element: (
      // <AuthGuard>
      //   <DashboardLayout>
      <GuestGuard>
        <AuthLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </AuthLayout>
      </GuestGuard>

      //  </DashboardLayout>
      // </AuthGuard>
    ),
    children: [
      { path: 'renew', element: <SubscriptionRenewPage /> },
      { path: 'success', element: <SubscriptionSuccessPage /> },
      { path: 'cancel', element: <SubscriptionCancelPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <GuestGuard>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'register',
    element: (
      <GuestGuard>
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <GuestGuard>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'reset-password',
    element: (
      <GuestGuard>
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'change-password',
    element: (
      <AuthLayout>
        <ChangePasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: 'verify-otp',
    element: (
      <AuthLayout>
        <VerifyOtpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  {
    path: 'home',
    element: (
      <GuestGuard>
        <AuthLayout>
          <HomePage />
        </AuthLayout>
      </GuestGuard>
    ),
  },
  { path: '*', element: <Page404 /> },
];
