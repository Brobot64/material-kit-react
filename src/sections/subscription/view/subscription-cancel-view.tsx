import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SubscriptionCancelView() {
  const router = useRouter();

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'error.lighter',
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Iconify icon="eva:close-circle-fill" width={48} />
          </Box>

          <Typography variant="h4" gutterBottom>
            Payment Cancelled
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            The payment process was cancelled. No charges were made.
            If you need help or encountered an issue, please contact support.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              onClick={() => router.push('/subscription/renew')}
            >
              Try Again
            </Button>
            <Button
              fullWidth
              size="large"
              variant="outlined"
              color="inherit"
              onClick={() => router.push('/app')}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardContent>
  );
}
