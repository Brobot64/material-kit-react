import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';

import { Helmet } from 'src/components/helmet';

// ----------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      setError('Business name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.createBusiness({ name: name.trim() });
      await refreshProfile();
      router.replace('/app');
    } catch (err) {
      setError((err as Error).message || 'Failed to create business');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet title="Create your business" />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Card sx={{ p: 4, width: 1, maxWidth: 440 }}>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">Create your business</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Set up your business to start using ShopMaster. Your main outlet and
                chart of accounts are created automatically.
              </Typography>
            </div>

            <TextField
              label="Business name"
              value={name}
              fullWidth
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              error={!!error}
              helperText={error || ' '}
            />

            <Button
              size="large"
              variant="contained"
              onClick={submit}
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create business'}
            </Button>
          </Stack>
        </Card>
      </Box>
    </>
  );
}
