import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import {
  platformAdminApi,
  type PlatformBusinessFeatures,
  type PlatformBusinessListItem,
} from '../api/platform-admin-api';

const DEFAULT_FEATURES: PlatformBusinessFeatures = {
  enableBarcode: false,
  enableReceiptPrinting: true,
  enableLowStockAlerts: true,
  lowStockThreshold: 5,
  enableExpiryTracking: false,
  defaultExpiryNotificationDays: 30,
};

export default function PlatformFeatureFlagsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PlatformBusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PlatformBusinessListItem | null>(null);
  const [features, setFeatures] = useState<PlatformBusinessFeatures>(DEFAULT_FEATURES);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.listBusinesses({
        page: 1,
        limit: 50,
        search: search || undefined,
      });
      setRows(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = async (row: PlatformBusinessListItem) => {
    setBusy(true);
    setError('');
    try {
      const detail = await platformAdminApi.getBusiness(row.id);
      setSelected(row);
      setFeatures({ ...DEFAULT_FEATURES, ...(detail.features || {}) });
    } catch (err: any) {
      setError(err.message || 'Failed to load features');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      await platformAdminApi.updateFeatures(selected.id, features);
      setSelected(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save features');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Feature flags</Typography>
        <Typography variant="body2" color="text.secondary">
          Per-tenant product toggles (BusinessSettings.features)
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Search businesses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button variant="outlined" onClick={load}>
            Refresh
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.owner?.email || '—'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEditor(row)} disabled={busy}>
                        Edit flags
                      </Button>
                      <Button size="small" onClick={() => navigate(`/admin/businesses/${row.id}`)}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No businesses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Feature flags — {selected?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={features.enableBarcode}
                  onChange={(e) => setFeatures((f) => ({ ...f, enableBarcode: e.target.checked }))}
                />
              }
              label="Enable barcode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enableReceiptPrinting}
                  onChange={(e) =>
                    setFeatures((f) => ({ ...f, enableReceiptPrinting: e.target.checked }))
                  }
                />
              }
              label="Enable receipt printing"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enableLowStockAlerts}
                  onChange={(e) =>
                    setFeatures((f) => ({ ...f, enableLowStockAlerts: e.target.checked }))
                  }
                />
              }
              label="Enable low stock alerts"
            />
            <TextField
              label="Low stock threshold"
              type="number"
              value={features.lowStockThreshold}
              onChange={(e) =>
                setFeatures((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))
              }
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enableExpiryTracking}
                  onChange={(e) =>
                    setFeatures((f) => ({ ...f, enableExpiryTracking: e.target.checked }))
                  }
                />
              }
              label="Enable expiry tracking"
            />
            <TextField
              label="Default expiry notification days"
              type="number"
              value={features.defaultExpiryNotificationDays}
              onChange={(e) =>
                setFeatures((f) => ({
                  ...f,
                  defaultExpiryNotificationDays: Number(e.target.value),
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
