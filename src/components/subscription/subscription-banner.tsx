import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

export function SubscriptionBanner() {
  const router = useRouter();
  const { subscriptionStatus } = useAuth();

  if (!subscriptionStatus.isExpiringSoon && !subscriptionStatus.isExpired) {
    return null;
  }

  return (
    <Box sx={{ p: 2, pb: 0 }}>
      <Alert
        severity={subscriptionStatus.isExpired ? 'error' : 'warning'}
        action={
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => router.push('/subscription/renew')}
          >
            Renew Now
          </Button>
        }
        sx={{ borderRadius: 1.5 }}
      >
        <AlertTitle sx={{ textTransform: 'capitalize' }}>
          Subscription {subscriptionStatus.isExpired ? 'Expired' : 'Expiring Soon'}
        </AlertTitle>
        {subscriptionStatus.isExpired
          ? 'Your access is limited. Please renew your subscription to continue using all features.'
          : `Your subscription expires in ${subscriptionStatus.daysLeft} days. Renew now to avoid any interruption.`}
      </Alert>
    </Box>
  );
}
