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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const USERS_STORAGE_KEY = 'app_users';
const SESSION_STORAGE_KEY = 'app_session';

const STEPS = ['Account Info', 'Security', 'Business Info', 'Address'];

export function SignUpView() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessMobile: '',
    street: '',
    city: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!formData.displayName || !formData.email || !formData.phone) {
        return 'Please fill in all fields';
      }
      // Simple email validation
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        return 'Please enter a valid email address';
      }
    }
    if (step === 1) {
      if (!formData.password || !formData.confirmPassword) {
        return 'Please fill in all fields';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters long';
      }
      const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{1,8}$/;
      if (!strongPasswordRegex.test(formData.password)) {
        return 'Password must include letters, numbers, and special characters, and must not exceed 8 characters';
      }
    }
    if (step === 2) {
      if (!formData.businessName || !formData.businessMobile || !formData.street) {
        return 'Please fill in all fields';
      }
    }
    if (step === 3) {
      if (!formData.city || !formData.state) {
        return 'Please fill in all fields';
      }
    }
    return null;
  };

  const handleNext = () => {
    const stepError = validateStep(activeStep);
    if (stepError) {
      setError(stepError);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSignUp = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const stepError = validateStep(activeStep);
      if (stepError) {
        setError(stepError);
        return;
      }

      // Get registered users from localStorage
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      const existingUser = users.find((u: { email: string }) => u.email === formData.email);
      if (existingUser) {
        setError('An account with this email already exists');
        return;
      }

      // Create new user
      const newUser = {
        ...formData,
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
    [formData, activeStep, router]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              name="displayName"
              label="Full Name"
              value={formData.displayName}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
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
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
              Password must contain letters, numbers, and special characters, and must not be more
              than 8 characters.
            </Typography>
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        <Iconify
                          icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth
              name="businessName"
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="businessMobile"
              label="Business Mobile"
              value={formData.businessMobile}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="street"
              label="Street Address"
              value={formData.street}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        );
      case 3:
        return (
          <>
            <TextField
              fullWidth
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="state"
              label="State"
              value={formData.state}
              onChange={handleChange}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderForm = (
    <Box
      component="form"
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

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        {activeStep > 0 && (
          <Button fullWidth size="large" variant="outlined" color="inherit" onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < STEPS.length - 1 ? (
          <Button fullWidth size="large" variant="contained" color="inherit" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="inherit"
            onClick={handleSignUp}
          >
            Sign up
          </Button>
        )}
      </Box>
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

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

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