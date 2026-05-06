import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { formatError } from 'src/utils/format-error';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ChangePasswordView() {
  const router = useRouter();
  const { changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
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
        await changePassword({ currentPassword, newPassword });
        router.push('/app');
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, changePassword, router]
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
        name="currentPassword"
        label="Current Password"
        type={showPassword ? 'text' : 'password'}
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
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
        name="newPassword"
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
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

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        disabled={loading}
      >
        Change Password
      </Button>

      <Button
        fullWidth
        size="large"
        color="error"
        variant="outlined"
        onClick={logout}
        disabled={loading}
      >
        Logout
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

        <Typography variant="h4">Update Password</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          For security reasons, you must change your password before continuing.
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}
