import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function UserCreateView() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: '',
    company: '',
    role: '',
    avatarUrl: '',
    emailVerified: true,
  });

  const handleInputChange = useCallback(
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
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

  const handleSwitchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      emailVerified: event.target.checked,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('Form data:', formData);
    router.push('/user');
  }, [formData, router]);

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
        Create a new user
      </Typography>

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
            />
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
            />
          </Box>

          {/* Phone and Country */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Phone number"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
            />
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={handleSelectChange('country')}
              >
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
                <MenuItem value="DE">Germany</MenuItem>
                <MenuItem value="FR">France</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* State and City */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="State/region"
              value={formData.state}
              onChange={handleInputChange('state')}
            />
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
            />
          </Box>

          {/* Address and Zip */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleInputChange('address')}
            />
            <TextField
              fullWidth
              label="Zip/code"
              value={formData.zipCode}
              onChange={handleInputChange('zipCode')}
            />
          </Box>

          {/* Company and Role */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={handleInputChange('company')}
            />
            <TextField
              fullWidth
              label="Role"
              value={formData.role}
              onChange={handleInputChange('role')}
            />
          </Box>

          {/* Email Verified Switch */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Email verified
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disabling this will automatically send the user a verification email
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailVerified}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label=""
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
          >
            Create user
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}
