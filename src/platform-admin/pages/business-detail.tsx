import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/contexts/auth-context';

import { platformAdminApi, type PlatformBusinessDetail } from '../api/platform-admin-api';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG');
}

export default function PlatformBusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [data, setData] = useState<PlatformBusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(14);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.getBusiness(id);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load business');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      setExtendOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Alert severity="error">{error || 'Business not found'}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={() => navigate('/admin/businesses')}>
          Back
        </Button>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {data.name}
        </Typography>
        <Chip label={data.status} color={data.status === 'active' ? 'success' : 'warning'} />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() =>
            run(() =>
              platformAdminApi.updateStatus(
                data.id,
                data.status === 'active' ? 'suspended' : 'active'
              )
            )
          }
        >
          {data.status === 'active' ? 'Suspend' : 'Activate'}
        </Button>
        <Button variant="outlined" disabled={busy} onClick={() => setExtendOpen(true)}>
          Extend trial
        </Button>
        <Button variant="contained" disabled={busy} onClick={() => run(() => platformAdminApi.markPaid(data.id))}>
          Mark paid / renew
        </Button>
        <Button
          variant="contained"
          color="warning"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await startImpersonation({
                businessId: data.id,
                ownerUserId: data.owner?.id,
                reason: 'Platform admin support view',
              });
              navigate('/app');
            })
          }
        >
          View as owner
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => navigate(`/admin/tickets?businessId=${data.id}`)}
        >
          Create ticket
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Subscription
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Plan: {data.plan?.name || '—'}</Typography>
              <Typography variant="body2">
                Price: {data.plan ? `${data.plan.currency} ${data.plan.price}` : '—'}
              </Typography>
              <Typography variant="body2">Start: {formatDate(data.subscriptionStart)}</Typography>
              <Typography variant="body2">End: {formatDate(data.subscriptionEnd)}</Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Owner
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">{data.owner?.fullName || '—'}</Typography>
              <Typography variant="body2">{data.owner?.email || '—'}</Typography>
              <Typography variant="body2">Last login: {formatDate(data.lastLoginAt)}</Typography>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Counts
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Outlets: {data.counts?.outlets ?? 0}</Typography>
              <Typography variant="body2">Users: {data.counts?.users ?? 0}</Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={extendOpen} onClose={() => setExtendOpen(false)}>
        <DialogTitle>Extend trial</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Days"
            type="number"
            fullWidth
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            inputProps={{ min: 1, max: 365 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() => run(() => platformAdminApi.extendTrial(data.id, extendDays))}
          >
            Extend
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
