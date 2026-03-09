import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SubscriptionSuccessView() {
  const router = useRouter();
  const { refreshProfile, subscriptionStatus } = useAuth();
  
  const [polling, setPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const sessionId = sessionStorage.getItem('checkoutSessionId');
    
    if (sessionId) {
      api.getPublicCheckoutSession(sessionId)
        .then((data) => {
          setSessionData(data);
        })
        .catch((error) => {
          console.error('Failed to fetch session details:', error);
        })
        .finally(() => {
          setLoadingSession(false);
        });
    } else {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const pollStatus = async () => {
      if (attempts > 10) {
        setPolling(false);
        return;
      }

      await refreshProfile();
      
      // If subscription is no longer expired, we can stop polling
      if (!subscriptionStatus.isExpired) {
        setPolling(false);
      } else {
        setAttempts((prev) => prev + 1);
        timer = setTimeout(pollStatus, 3000); // Poll every 3 seconds
      }
    };

    pollStatus();

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, subscriptionStatus.isExpired]);

  const renderSessionInfo = () => {
    if (loadingSession) return <CircularProgress size={24} />;
    if (!sessionData) return null;

    return (
      <Box sx={{ mt: 3, p: 3, borderRadius: 2, bgcolor: 'background.neutral', textAlign: 'left', width: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Details
        </Typography>
        
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
            <Label color={sessionData.status === 'complete' ? 'success' : 'warning'}>
              {sessionData.status}
            </Label>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Payment</Typography>
            <Label color={sessionData.paymentStatus === 'paid' ? 'success' : 'error'}>
              {sessionData.paymentStatus}
            </Label>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Email</Typography>
            <Typography variant="body2">{sessionData.customerEmail}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Amount</Typography>
            <Typography variant="subtitle2">
              {fCurrency(sessionData.amountTotal / 100)} {sessionData.currency?.toUpperCase()}
            </Typography>
          </Stack>
          
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Transaction ID</Typography>
            <Typography variant="caption" sx={{ wordBreak: 'break-all', maxWidth: 150 }}>
              {sessionData.id}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    );
  };

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Card sx={{ p: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" width={48} />
          </Box>

          <Typography variant="h4" gutterBottom>
            Payment Successful!
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Thank you for your payment. Your subscription is being updated.
          </Typography>

          {renderSessionInfo()}

          {polling ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <CircularProgress size={32} sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Updating your account status...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 3, width: 1 }}>
              <Typography variant="subtitle1" color="success.main" gutterBottom>
                Subscription Reactivated
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                You can now access all your dashboard features.
              </Typography>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => router.push('/')}
              >
                Go to Dashboard
              </Button>
            </Box>
          )}

          {!polling && attempts > 10 && subscriptionStatus.isExpired && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="warning.main">
                It&apos;s taking a bit longer to sync your status. Please wait a few moments and refresh.
              </Typography>
              <Button sx={{ mt: 1 }} onClick={() => window.location.reload()}>
                Manual Refresh
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </DashboardContent>
  );
}
