import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { formatError } from 'src/utils/format-error';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function JwtVerifyOtpView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        setError('Email is missing');
        return;
      }

      try {
        setLoading(true);
        setError('');
        setSuccess('');
        await verifyOtp(email, otp);
        router.push('/app');
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, otp, router, verifyOtp]
  );

  const handleResend = useCallback(async () => {
    if (!email) {
      setError('Email is missing');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await resendOtp(email);
      setSuccess('OTP resent successfully');
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, [email, resendOtp]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleVerify}
      sx={{
        gap: 3,
        width: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        name="otp"
        label="OTP Code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit code"
        required
        autoComplete="one-time-code"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        Don&apos;t have a code?{' '}
        <Link
          variant="subtitle2"
          sx={{ cursor: 'pointer', ...(loading && { pointerEvents: 'none', opacity: 0.5 }) }}
          onClick={handleResend}
        >
          Resend code
        </Link>
      </Typography>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        Verify
      </LoadingButton>

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        onClick={() => router.push('/sign-in')}
        disabled={loading}
      >
        Return to Sign In
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
          textAlign: 'center',
        }}
      >
        <Iconify
          icon="solar:shield-keyhole-bold-duotone"
          width={64}
          sx={{ color: 'primary.main', mb: 2 }}
        />

        <Typography variant="h4">Verify OTP</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We have sent a verification code to {email}
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}
