import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Step from '@mui/material/Step';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import StepLabel from '@mui/material/StepLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { formatError } from 'src/utils/format-error';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEPS = ['Account Info', 'Security', 'Business Info', 'Address'];

export function SignUpView() {
  const router = useRouter();
  const { register } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const validateStep = useCallback(
    (step: number) => {
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
        const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,25}$/;
        if (!strongPasswordRegex.test(formData.password)) {
          return 'Password must include letters, numbers, and special characters, and must not exceed 25 characters';
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
    },
    [formData]
  );

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
    async (e: React.FormEvent) => {
      e.preventDefault();
      const stepError = validateStep(activeStep);
      if (stepError) {
        setError(stepError);
        return;
      }

      setLoading(true);
      try {
        await register({
          fullName: formData.displayName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'user',
          phone: formData.phone,
          businessName: formData.businessName,
          businessMobile: formData.businessMobile,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
          },
        });

        router.push(`/verify-otp?email=${formData.email}`);
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    },
    [formData, activeStep, router, register, validateStep]
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
              autoComplete="name"
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
              autoComplete="email"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
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
              autoComplete="new-password"
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
              than 25 characters.
            </Typography>
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
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
              autoComplete="organization"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="businessMobile"
              label="Business Mobile"
              value={formData.businessMobile}
              onChange={handleChange}
              required
              autoComplete="tel"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="street"
              label="Street Address"
              value={formData.street}
              onChange={handleChange}
              required
              autoComplete="street-address"
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
              autoComplete="address-level2"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              name="state"
              label="State"
              value={formData.state}
              onChange={handleChange}
              required
              autoComplete="address-level1"
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
          <Button fullWidth size="large" variant="contained" color="inherit" onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <LoadingButton fullWidth size="large" variant="contained" color="inherit" loading={loading} onClick={handleSignUp}>
            Sign up
          </LoadingButton>
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
