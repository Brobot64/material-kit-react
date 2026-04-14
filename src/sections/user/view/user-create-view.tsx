import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { NumericInput } from 'src/components/numeric-input';

// ----------------------------------------------------------------------

export function UserCreateView() {
  const router = useRouter();
  const { onboardEmployee, appData, outlets } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'sales_rep',
    salary: 0,
    position: '',
    outletId: appData?.outletId || (outlets.length > 0 ? outlets[0].id : ''),
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback(
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleNumericChange = useCallback(
    (field: string) => (value: number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (field: string) => (event: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      if (!appData?.businessId) {
        throw new Error('Business ID is missing. Please try logging in again.');
      }

      await onboardEmployee({
        ...formData,
        businessId: appData.businessId,
      });

      router.push('/user');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to onboard employee');
    } finally {
      setLoading(false);
    }
  }, [formData, onboardEmployee, appData?.businessId, router]);

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'User', href: '/user' },
          { name: 'Create' },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 5 }}>
        Onboard new employee
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Profile Photo Upload */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'grey.200',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.300' },
              }}
            >
              <Iconify icon="mingcute:add-line" width={40} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Upload photo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Allowed *.jpeg, *.jpg, *.png, *.gif
                <br />
                max size of 3 Mb
              </Typography>
            </Box>
          </Box>

          {/* Name and Email Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Full name"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              required
            />
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />
          </Box>

          {/* Phone and Role */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Phone number"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={formData.role} label="Role" onChange={handleSelectChange('role')}>
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="outlet_admin">Outlet Admin</MenuItem>
                <MenuItem value="sales_rep">Sales Representative</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Position and Outlet */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Position"
              placeholder="e.g. Cashier, Store Keeper"
              value={formData.position}
              onChange={handleInputChange('position')}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Outlet</InputLabel>
              <Select
                value={formData.outletId}
                label="Outlet"
                onChange={handleSelectChange('outletId')}
                required
              >
                {outlets.map((outlet) => (
                  <MenuItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Salary Field */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <NumericInput
              fullWidth
              label="Monthly Salary"
              value={formData.salary}
              onChangeValue={handleNumericChange('salary')}
              helperText="Formatted with commas, no negative values allowed."
              required
            />
          </Box>
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            onClick={handleSubmit}
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            Onboard employee
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}