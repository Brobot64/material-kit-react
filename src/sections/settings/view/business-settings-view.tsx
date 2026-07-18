import type { BusinessSettings } from 'src/types/business-settings';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

const DEFAULTS: Omit<BusinessSettings, 'businessId'> = {
  brandPrimaryColor: '#2563eb',
  brandSecondaryColor: '#7c3aed',
  timezone: 'Africa/Lagos',
  currency: 'NGN',
  currencySymbol: '₦',
  features: {
    enableBarcode: false,
    enableReceiptPrinting: true,
    enableLowStockAlerts: true,
    lowStockThreshold: 5,
    enableExpiryTracking: false,
    defaultExpiryNotificationDays: undefined,
  } as any,
};

export function BusinessSettingsView() {
  const { appData, updateAppData } = useAuth();
  const businessId = appData?.businessId;
  const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';

  const [form, setForm] = useState<Partial<BusinessSettings>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await api.getBusinessSettings(businessId);
      if (data) setForm({ ...DEFAULTS, ...data });
    } catch { /* use defaults */ }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const setFeature = (field: string, value: any) =>
    setForm((p) => ({ ...p, features: { ...(p.features ?? DEFAULTS.features), [field]: value } }));       

  const handleSave = async () => {
    if (!businessId) return;
    const features = form.features as any;
    if (features?.enableExpiryTracking) {
      const lead = Number(features.defaultExpiryNotificationDays);
      if (!Number.isFinite(lead) || lead < 1 || lead > 365) {
        setSnack({
          open: true,
          msg: 'Set alert days before expiry (1–365) when enabling product expiry tracking.',
          severity: 'error',
        });
        return;
      }
    }
    setSaving(true);
    try {
      await api.upsertBusinessSettings({ ...form, businessId });
      // Clear cached settings
      localStorage.removeItem('businessSettings');
      // Update local appData settings
      updateAppData({ businessSettings: form });
      setSnack({ open: true, msg: 'Business settings saved successfully.', severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[{ name: 'Dashboard', href: '/app' }, { name: 'Business Settings' }]}
        sx={{ mb: 2 }}
      />

      <PageHeader
        kicker="Settings"
        title="Business Settings"
        subtitle="Branding, store preferences, and inventory features."
      />

      <Grid container spacing={3}>
        {/* Branding */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Branding</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                These settings control how your business looks across the platform.
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Business Display Name"
                  size="small"
                  fullWidth
                  value={form.displayName ?? ''}
                  onChange={(e) => set('displayName', e.target.value)}
                  helperText="Shown in the browser title and header"
                  disabled={!isOwner}
                />

                <TextField
                  label="Logo URL"
                  size="small"
                  fullWidth
                  value={form.logoUrl ?? ''}
                  onChange={(e) => set('logoUrl', e.target.value)}
                  placeholder="https://your-cdn.com/logo.png"
                  disabled={!isOwner}
                  InputProps={{
                    endAdornment: form.logoUrl ? (
                      <Avatar src={form.logoUrl} sx={{ width: 28, height: 28, mr: -0.5 }} variant="rounded" />
                    ) : undefined,
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Brand Primary Color</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="input"
                        type="color"
                        value={form.brandPrimaryColor ?? '#2563eb'}
                        onChange={(e: any) => set('brandPrimaryColor', e.target.value)}
                        disabled={!isOwner}
                        sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, cursor: isOwner ? 'pointer' : 'default', p: 0 }}
                      />
                      <TextField
                        size="small"
                        value={form.brandPrimaryColor ?? '#2563eb'}
                        onChange={(e) => set('brandPrimaryColor', e.target.value)}
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 7 }}
                        disabled={!isOwner}
                      />
                    </Stack>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Brand Secondary Color</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="input"
                        type="color"
                        value={form.brandSecondaryColor ?? '#7c3aed'}
                        onChange={(e: any) => set('brandSecondaryColor', e.target.value)}
                        disabled={!isOwner}
                        sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, cursor: isOwner ? 'pointer' : 'default', p: 0 }}
                      />
                      <TextField
                        size="small"
                        value={form.brandSecondaryColor ?? '#7c3aed'}
                        onChange={(e) => set('brandSecondaryColor', e.target.value)}
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 7 }}
                        disabled={!isOwner}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1, height: 32, borderRadius: 1, bgcolor: form.brandPrimaryColor ?? '#2563eb', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <Box sx={{ flex: 1, height: 32, borderRadius: 1, bgcolor: form.brandSecondaryColor ?? '#7c3aed', border: '1px solid rgba(0,0,0,0.1)' }} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Store settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Store Settings</Typography>
              <Stack spacing={3}>
                <TextField
                  label="POS Welcome Message"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.posWelcomeMessage ?? ''}
                  onChange={(e) => set('posWelcomeMessage', e.target.value)}
                  placeholder="e.g. Welcome! How can we help you today?"
                  disabled={!isOwner}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Timezone"
                    size="small"
                    fullWidth
                    value={form.timezone ?? 'Africa/Lagos'}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Currency"
                    size="small"
                    value={`${form.currency ?? 'NGN'} (${form.currencySymbol ?? '₦'})`}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>

                <Divider />
                <Typography variant="subtitle2">Inventory Features</Typography>
                {[
                  { key: 'enableBarcode', label: 'Enable Barcode Scanning' },
                  { key: 'enableReceiptPrinting', label: 'Enable Receipt Printing' },
                  { key: 'enableLowStockAlerts', label: 'Low Stock Alerts' },
                  { key: 'enableExpiryTracking', label: 'Product Expiry Tracking' },
                ].map(({ key, label }) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        size="small"
                        checked={Boolean((form.features as any)?.[key])}
                        onChange={(e) => setFeature(key, e.target.checked)}
                        disabled={!isOwner}
                      />
                    }
                    label={<Typography variant="body2">{label}</Typography>}
                  />
                ))}

                {!!(form.features as any)?.enableLowStockAlerts && (
                  <TextField
                    label="Low Stock Threshold"
                    size="small"
                    type="number"
                    value={form.features?.lowStockThreshold ?? 5}
                    onChange={(e) => setFeature('lowStockThreshold', Number(e.target.value))}
                    sx={{ maxWidth: 200 }}
                    disabled={!isOwner}
                  />
                )}

                {!!(form.features as any)?.enableExpiryTracking && (
                  <TextField
                    label="Alert Days Before Expiry"
                    size="small"
                    type="number"
                    required
                    value={(form.features as any)?.defaultExpiryNotificationDays ?? ''}
                    onChange={(e) =>
                      setFeature(
                        'defaultExpiryNotificationDays',
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                    sx={{ maxWidth: 200 }}
                    helperText="Required when expiry tracking is on (1–365 days)"
                    error={
                      !(form.features as any)?.defaultExpiryNotificationDays ||
                      Number((form.features as any)?.defaultExpiryNotificationDays) < 1
                    }
                    disabled={!isOwner}
                    inputProps={{ min: 1, max: 365 }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isOwner && (
        <Box sx={{ mt: 3 }}>
          <LoadingButton variant="contained" loading={saving} onClick={handleSave} size="large">
            Save Settings
          </LoadingButton>
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity as any} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
