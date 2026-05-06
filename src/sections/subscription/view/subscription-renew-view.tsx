import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SubscriptionRenewView() {
  const router = useRouter();
  const { subscriptionStatus, appData, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract businessId and userId from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const businessIdFromUrl = urlParams.get('businessId');
  const userIdFromUrl = urlParams.get('userId');

  const handleRenew = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createCheckoutSession({ 
        businessId: businessIdFromUrl || appData?.businessId, 
        userId: userIdFromUrl || user?.id 
      });
      if (response.sessionId) {
        sessionStorage.setItem('checkoutSessionId', response.sessionId);
      }
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (err) {
      console.error('Renewal error:', err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const businessName = appData?.businessName || 'Your Business';
  const statusLabel = subscriptionStatus.isExpired ? 'Expired' : 'Active';
  const expiryDate = subscriptionStatus.endDate
    ? new Date(subscriptionStatus.endDate).toLocaleDateString()
    : 'Unknown';

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Box
            component="img"
            src="/assets/illustrations/illustration-dashboard.webp"
            sx={{ width: 200, mb: 3, mx: 'auto' }}
          />

          <Typography variant="h4" gutterBottom>
            Renew Subscription
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            {subscriptionStatus.isExpired
              ? 'Your subscription has expired. Renew now to regain access to your dashboard and business tools.'
              : `Your subscription will expire in ${subscriptionStatus.daysLeft} days. Renew now to ensure uninterrupted service.`}
          </Typography>

          <Box
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              textAlign: 'left',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Plan Details:
            </Typography>
            <Typography variant="body2">Business: {businessName}</Typography>
            <Typography variant="body2">
              Status: {statusLabel}
            </Typography>
            <Typography variant="body2">
              Expires on: {expiryDate}
            </Typography>
            {(businessIdFromUrl || userIdFromUrl) && !isAuthenticated && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                ID: {businessIdFromUrl || userIdFromUrl}
              </Typography>
            )}
          </Box>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            loading={loading}
            onClick={handleRenew}
            startIcon={<Iconify icon="eva:flash-fill" />}
          >
            Renew with Stripe
          </LoadingButton>

          <Button
            fullWidth
            size="small"
            color="inherit"
            sx={{ mt: 2 }}
            onClick={() => {
              if (isAuthenticated) {
                router.push('/');
              } else {
                router.push('/sign-in');
              }
            }}
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Sign In'}
          </Button>
        </Card>
      </Box>
    </DashboardContent>
  );
}
