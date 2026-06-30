import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { formatError } from 'src/utils/format-error';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { resetPassword } = useAuth();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      setError('');

      try {
        await resetPassword(email, otp, newPassword);
        router.push('/sign-in');
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, otp, newPassword, confirmPassword, resetPassword, router]
  );

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSubmit}
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

      <TextField
        fullWidth
        name="newPassword"
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        Reset Password
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

        <Typography variant="h4">Reset Password</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We have sent a 6-digit confirmation code to {email}. Please enter the code in below box to verify your email.
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}
