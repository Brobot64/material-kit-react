import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const USERS_STORAGE_KEY = 'app_users';
const SESSION_STORAGE_KEY = 'app_session';

export function SignUpView() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Validate inputs
      if (!displayName || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Strong password check (letters, numbers, special characters, max 8 chars)
      const strongPasswordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{1,8}$/;

      if (!strongPasswordRegex.test(password)) {
        setError(
          'Password must include letters, numbers, and special characters, and must not exceed 8 characters'
        );
        return;
      }

      // Get registered users from localStorage
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      const existingUser = users.find((u: { email: string }) => u.email === email);
      if (existingUser) {
        setError('An account with this email already exists');
        return;
      }

      // Create new user
      const newUser = {
        email,
        password,
        displayName,
        photoURL: '/assets/images/avatar/avatar-25.webp',
        createdAt: new Date().toISOString(),
      };

      // Save user to localStorage
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Create session and log in automatically
      const session = {
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

      // Redirect to home
      router.push('/');
    },
    [displayName, email, password, confirmPassword, router]
  );

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignUp}
      sx={{
        gap: 2,
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
        name="displayName"
        label="Full Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

      {/* Password rules */}
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
        Password must contain letters, numbers, and special characters, and must not be more than 8
        characters.
      </Typography>

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify
                    icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button fullWidth size="large" type="submit" color="inherit" variant="contained">
        Sign up
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
        <Typography variant="h5">Sign up</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Already have an account?
          <Link
            variant="subtitle2"
            sx={{ ml: 0.5, cursor: 'pointer' }}
            onClick={() => router.push('/sign-in')}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}
