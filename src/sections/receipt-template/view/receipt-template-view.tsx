import type { ReceiptTemplate } from 'src/types/business-settings';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
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

import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

const DEFAULT_TEMPLATE: Omit<ReceiptTemplate, '_id' | 'businessId'> = {
  primaryColor: '#1a1a2e',
  secondaryColor: '#ffffff',
  showBarcode: false,
  showTaxBreakdown: true,
  sections: {
    showCustomerInfo: true,
    showSaleNumber: true,
    showCashierName: true,
    showItemCosts: false,
  },
};

function fmt(n: number) {
  return `â‚¦${(n ?? 0).toLocaleString('en-NG')}`;
}

function ReceiptLivePreview({ template }: { template: Partial<ReceiptTemplate> }) {
  const primary = template.primaryColor || '#1a1a2e';
  return (
    <Box
      sx={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '11px',
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: 2,
        maxWidth: 280,
        mx: 'auto',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {template.watermarkText && (
        <Box
          sx={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%,-50%) rotate(-45deg)',
            fontSize: '26px', fontWeight: 900, color: primary,
            opacity: 0.06, pointerEvents: 'none', userSelect: 'none',
            whiteSpace: 'nowrap', zIndex: 0,
          }}
        >
          {template.watermarkText}
        </Box>
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          {template.logoUrl && (
            <Box component="img" src={template.logoUrl} alt="logo"
              sx={{ height: 36, mb: 0.5, objectFit: 'contain' }} />
          )}
          <Typography sx={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: primary }}>
            My Store Lagos
          </Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', color: '#666' }}>
            123 Broad Street, Lagos Island
          </Typography>
          {template.headerText && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', color: '#555', mt: 0.5 }}>
              {template.headerText}
            </Typography>
          )}
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
        <Box sx={{ fontSize: '10px', lineHeight: 1.8 }}>
          {template.sections?.showSaleNumber !== false && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Receipt #:</span><span style={{ fontWeight: 700 }}>RCP-00042</span>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span><span>{new Date().toLocaleDateString('en-NG')}</span>
          </Box>
          {template.sections?.showCashierName !== false && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cashier:</span><span>Aisha Bello</span>
            </Box>
          )}
          {template.sections?.showCustomerInfo && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer:</span><span>Walk-in</span>
            </Box>
          )}
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
        <Stack spacing={0.5}>
          {[
            { name: 'Samsung S24 Ultra', sku: 'SAM-S24U', qty: 1, price: 850000, total: 850000 },
            { name: 'Screen Guard', sku: 'ACC-001', qty: 2, price: 3500, total: 7000 },
          ].map((item, i) => (
            <Box key={i}>
              <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 600 }}>
                {item.name} ({item.sku})
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', pl: 1 }}>
                <span>{item.qty} Ã— {fmt(item.price)}</span>
                <span style={{ fontWeight: 600 }}>{fmt(item.total)}</span>
              </Box>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
        <Box sx={{ fontSize: '10px', lineHeight: 1.8 }}>
          {template.showTaxBreakdown && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax (7.5%):</span><span>{fmt(64275)}</span>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', color: primary, mt: 0.5 }}>
            <span>TOTAL</span><span>{fmt(921275)}</span>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Paid (Cash):</span><span>{fmt(1000000)}</span>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Change:</span><span>{fmt(78725)}</span>
          </Box>
        </Box>
        {template.footerText && (
          <>
            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
            <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', textAlign: 'center', color: '#666' }}>
              {template.footerText}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function ReceiptTemplateView() {
  const { appData, outlets } = useAuth();
  const businessId = appData?.businessId;
  const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';

  const [form, setForm] = useState<Partial<ReceiptTemplate>>(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await api.getReceiptTemplate(businessId);
      if (data) setForm({ ...DEFAULT_TEMPLATE, ...data });
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSection = (field: string, value: boolean) => {
    setForm((prev) => ({ ...prev, sections: { ...(prev.sections ?? DEFAULT_TEMPLATE.sections), [field]: value } }));
  };

  const handleSave = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      await api.upsertReceiptTemplate({ ...form, businessId });
      setSnack({ open: true, msg: 'Receipt template saved', severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[{ name: 'Dashboard', href: '/app' }, { name: 'Receipt Template' }]}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {/* Configuration panel */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Receipt Configuration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Customize how receipts look when printed or sent to customers.
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Primary Color</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="input"
                        type="color"
                        value={form.primaryColor ?? '#1a1a2e'}
                        onChange={(e: any) => handleChange('primaryColor', e.target.value)}
                        sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer', p: 0 }}
                      />
                      <TextField
                        size="small"
                        value={form.primaryColor ?? '#1a1a2e'}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 7 }}
                      />
                    </Stack>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Secondary Color</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="input"
                        type="color"
                        value={form.secondaryColor ?? '#ffffff'}
                        onChange={(e: any) => handleChange('secondaryColor', e.target.value)}
                        sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer', p: 0 }}
                      />
                      <TextField
                        size="small"
                        value={form.secondaryColor ?? '#ffffff'}
                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 7 }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <TextField
                  label="Logo URL"
                  size="small"
                  fullWidth
                  value={form.logoUrl ?? ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://your-cdn.com/logo.png"
                />

                <TextField
                  label="Header Text"
                  size="small"
                  fullWidth
                  value={form.headerText ?? ''}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  placeholder="e.g. Thank you for shopping with us!"
                />

                <TextField
                  label="Footer Text"
                  size="small"
                  fullWidth
                  value={form.footerText ?? ''}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="e.g. Goods sold are not returnable. Exchange within 7 days."
                />

                <TextField
                  label="Watermark Text (optional)"
                  size="small"
                  fullWidth
                  value={form.watermarkText ?? ''}
                  onChange={(e) => handleChange('watermarkText', e.target.value)}
                  placeholder="e.g. PAID"
                  helperText="Printed lightly in the background of the receipt"
                />

                <Divider />

                <Typography variant="subtitle2">Section Visibility</Typography>
                <Grid container spacing={1}>
                  {[
                    { key: 'showSaleNumber', label: 'Show Receipt Number' },
                    { key: 'showCashierName', label: 'Show Cashier Name' },
                    { key: 'showCustomerInfo', label: 'Show Customer Info' },
                    { key: 'showItemCosts', label: 'Show Item Cost Prices' },
                  ].map(({ key, label }) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={!!(form.sections as any)?.[key]}
                            onChange={(e) => handleSection(key, e.target.checked)}
                          />
                        }
                        label={<Typography variant="body2">{label}</Typography>}
                      />
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={form.showTaxBreakdown ?? true}
                          onChange={(e) => handleChange('showTaxBreakdown', e.target.checked)}
                        />
                      }
                      label={<Typography variant="body2">Show Tax Breakdown</Typography>}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={form.showBarcode ?? false}
                          onChange={(e) => handleChange('showBarcode', e.target.checked)}
                        />
                      }
                      label={<Typography variant="body2">Show Barcode</Typography>}
                    />
                  </Grid>
                </Grid>

                {isOwner && (
                  <LoadingButton
                    variant="contained"
                    loading={saving}
                    onClick={handleSave}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Save Template
                  </LoadingButton>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Live preview panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Live Preview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Preview updates as you make changes.
              </Typography>
              <ReceiptLivePreview template={form} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
