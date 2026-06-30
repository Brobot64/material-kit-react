import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

const emptyForm = {
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
};

export function OutletsView() {
  const { outlets, appData, refreshOutlets } = useAuth();
  const businessId = appData?.businessId;

  const [openModal, setOpenModal] = useState(false);
  const [editOutlet, setEditOutlet] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const openCreate = () => { setEditOutlet(null); setForm(emptyForm); setOpenModal(true); };
  const openEdit = (outlet: any) => {
    setEditOutlet(outlet);
    setForm({
      name: outlet.name || '',
      phone: outlet.phone || '',
      street: outlet.address?.street || '',
      city: outlet.address?.city || '',
      state: outlet.address?.state || '',
    });
    setOpenModal(true);
  };

  const handleClose = () => { setOpenModal(false); setEditOutlet(null); };

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        address: (form.street || form.city || form.state)
          ? { street: form.street, city: form.city, state: form.state, country: 'Nigeria' }
          : undefined,
        businessId: businessId!,
      };

      if (editOutlet) {
        await api.updateOutlet(editOutlet._id || editOutlet.id, {
          name: form.name,
          phone: form.phone || undefined,
          address: payload.address,
        });
        setSnackbar({ open: true, message: 'Outlet updated', severity: 'success' });
      } else {
        await api.createOutlet(payload);
        setSnackbar({ open: true, message: 'Outlet created', severity: 'success' });
      }

      await refreshOutlets();
      handleClose();
    } catch (error: any) {
      setSnackbar({ open: true, message: formatError(error), severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [form, businessId, editOutlet, refreshOutlets]);

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Outlets' }]} sx={{ mb: 3 }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4">Outlets</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your physical store locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openCreate}
        >
          New Outlet
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {outlets.map((outlet: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={outlet._id || outlet.id}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="subtitle1" fontWeight="bold">{outlet.name}</Typography>
                    {outlet.isMain && (
                      <Label color="primary" variant="soft">Main</Label>
                    )}
                    {outlet.isActive === false && (
                      <Label color="error" variant="soft">Inactive</Label>
                    )}
                  </Stack>
                  {outlet.phone && (
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                      <Iconify icon="solar:pen-bold" width={14} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{outlet.phone}</Typography>
                    </Stack>
                  )}
                  {(outlet.address?.street || outlet.address?.city) && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon="solar:settings-bold-duotone" width={14} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {[outlet.address?.street, outlet.address?.city, outlet.address?.state]
                          .filter(Boolean).join(', ')}
                      </Typography>
                    </Stack>
                  )}
                </Box>
                <IconButton size="small" onClick={() => openEdit(outlet)}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}

        {outlets.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <Iconify icon="solar:home-angle-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No outlets yet</Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                Create your first outlet to start selling
              </Typography>
              <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
                Create Outlet
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Create / Edit dialog */}
      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editOutlet ? 'Edit Outlet' : 'Create Outlet'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              required
              label="Outlet Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: -1 }}>
              Address (Optional)
            </Typography>
            <TextField
              fullWidth
              label="Street"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={submitting}
            onClick={handleSubmit}
            disabled={!form.name.trim()}
          >
            {editOutlet ? 'Save Changes' : 'Create Outlet'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
