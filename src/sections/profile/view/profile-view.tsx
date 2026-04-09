import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { user, refreshProfile } = useAuth();

  const [currentTab, setCurrentTab] = useState('account');

  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    themePreference: user?.themePreference || 'light',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.updateProfile({
        fullName: profileData.fullName,
        themePreference: profileData.themePreference,
        address: profileData.address,
      });
      await refreshProfile();
      alert('Profile updated successfully');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Password updated successfully');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Profile
      </Typography>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Tab
          label="Account"
          value="account"
          icon={<Iconify icon="solar:user-bold" width={24} />}
        />
        <Tab
          label="Security"
          value="security"
          icon={<Iconify icon="solar:lock-password-bold" width={24} />}
        />
      </Tabs>

      {currentTab === 'account' && (
        <Card sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
            }}
          >
            <TextField
              name="fullName"
              label="Full Name"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              inputProps={{ style: { textTransform: 'capitalize' } }}
            />
            <TextField
              name="email"
              label="Email Address"
              value={profileData.email}
              disabled
            />

            <TextField
              name="street"
              label="Street"
              value={profileData.address.street}
              onChange={(e) => setProfileData({
                ...profileData,
                address: { ...profileData.address, street: e.target.value }
              })}
            />
            <TextField
              name="city"
              label="City"
              value={profileData.address.city}
              onChange={(e) => setProfileData({
                ...profileData,
                address: { ...profileData.address, city: e.target.value }
              })}
            />
            <TextField
              name="state"
              label="State"
              value={profileData.address.state}
              onChange={(e) => setProfileData({
                ...profileData,
                address: { ...profileData.address, state: e.target.value }
              })}
            />
            <TextField
              name="country"
              label="Country"
              value={profileData.address.country}
              onChange={(e) => setProfileData({
                ...profileData,
                address: { ...profileData.address, country: e.target.value }
              })}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={handleUpdateProfile}
            >
              Save Changes
            </LoadingButton>
          </Box>
        </Card>
      )}

      {currentTab === 'security' && (
        <Card sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
            }}
          >
            <TextField
              name="currentPassword"
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <TextField
              name="newPassword"
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <TextField
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={handleChangePassword}
            >
              Change Password
            </LoadingButton>
          </Box>
        </Card>
      )}
    </DashboardContent>
  );
}
