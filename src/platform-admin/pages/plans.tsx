import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { platformAdminApi, type PlatformPlan } from '../api/platform-admin-api';

const emptyForm = {
  name: '',
  description: '',
  price: 10000,
  currency: 'NGN',
  durationInDays: 30,
  maxOutlets: 3,
  maxUsers: 10,
  maxProducts: 1000,
};

export default function PlatformPlansPage() {
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.getPlans();
      setPlans(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (plan: PlatformPlan) => {
    setEditingId(plan._id || plan.id || null);
    setForm({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price ?? 0,
      currency: plan.currency || 'NGN',
      durationInDays: plan.durationInDays ?? 30,
      maxOutlets: plan.maxOutlets ?? 1,
      maxUsers: plan.maxUsers ?? 1,
      maxProducts: plan.maxProducts ?? 1000,
    });
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      if (editingId) {
        await platformAdminApi.updatePlan(editingId, form);
      } else {
        await platformAdminApi.createPlan(form);
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save plan');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    setBusy(true);
    setError('');
    try {
      await platformAdminApi.deletePlan(id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Plans</Typography>
          <Typography variant="body2" color="text.secondary">
            Create and edit subscription plan limits and pricing
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={openCreate}>
          New plan
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Duration (days)</TableCell>
                  <TableCell>Max outlets</TableCell>
                  <TableCell>Max users</TableCell>
                  <TableCell>Max products</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => {
                  const id = plan._id || plan.id || '';
                  return (
                    <TableRow key={id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>
                        {plan.currency} {plan.price}
                      </TableCell>
                      <TableCell>{plan.durationInDays}</TableCell>
                      <TableCell>{plan.maxOutlets}</TableCell>
                      <TableCell>{plan.maxUsers}</TableCell>
                      <TableCell>{plan.maxProducts ?? '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(plan)} disabled={busy}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => remove(id)} disabled={busy}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No plans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit plan' : 'Create plan'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Duration (days)"
              type="number"
              value={form.durationInDays}
              onChange={(e) => setForm((f) => ({ ...f, durationInDays: Number(e.target.value) }))}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Max outlets"
                type="number"
                value={form.maxOutlets}
                onChange={(e) => setForm((f) => ({ ...f, maxOutlets: Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Max users"
                type="number"
                value={form.maxUsers}
                onChange={(e) => setForm((f) => ({ ...f, maxUsers: Number(e.target.value) }))}
                fullWidth
              />
              <TextField
                label="Max products"
                type="number"
                value={form.maxProducts}
                onChange={(e) => setForm((f) => ({ ...f, maxProducts: Number(e.target.value) }))}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !form.name.trim()} onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
