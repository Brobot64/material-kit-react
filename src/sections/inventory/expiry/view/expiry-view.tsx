import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function ExpiryView() {
  const { outlets, appData } = useAuth();
  const isOwner = appData?.role === 'owner';
  const assignedOutletId = appData?.outletId;

  const [tab, setTab] = useState<'EXPIRING_SOON' | 'EXPIRED'>('EXPIRING_SOON');
  const [selectedOutletId, setSelectedOutletId] = useState(assignedOutletId || outlets[0]?.id || outlets[0]?._id || '');

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editItem, setEditItem] = useState<any>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clearanceOpen, setClearanceOpen] = useState(false);
  const [clearance, setClearance] = useState({ amount: '', description: '', paymentMethod: 'cash' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const fetchExpiry = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    try {
      const res = await api.getExpiryStatus({
        outletId: selectedOutletId,
        status: tab,
        page: page + 1,
        limit: rowsPerPage,
      });
      setItems(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load expiry data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedOutletId, tab, page, rowsPerPage]);

  useEffect(() => {
    fetchExpiry();
  }, [fetchExpiry]);

  useEffect(() => { setPage(0); }, [selectedOutletId, tab]);

  const handleUpdateExpiry = async () => {
    if (!editItem || !newExpiryDate) return;
    setSubmitting(true);
    try {
      await api.updateLotExpiry(editItem._id, { expiryDate: newExpiryDate });
      setSnackbar({ open: true, message: 'Expiry date updated', severity: 'success' });
      setEditItem(null);
      fetchExpiry();
    } catch {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearance = async () => {
    const amount = Number(clearance.amount);
    const description = clearance.description.trim();
    if (!amount || amount <= 0) {
      setSnackbar({ open: true, message: 'Enter a valid clearance amount', severity: 'error' });
      return;
    }
    if (description.length < 10 || description.length > 500) {
      setSnackbar({
        open: true,
        message: 'Description is required (10–500 characters)',
        severity: 'error',
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.recordCashflowManualAdjustment({
        type: 'credit',
        amount,
        description,
        paymentMethod: clearance.paymentMethod,
        outletId: selectedOutletId,
      });
      setSnackbar({
        open: true,
        message: 'Clearance cashflow recorded (off-record — not linked to product/sale).',
        severity: 'success',
      });
      setClearanceOpen(false);
      setClearance({ amount: '', description: '', paymentMethod: 'cash' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Clearance failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/app' },
          { name: 'Inventory', href: '/app/inventory' },
          { name: 'Expiry Management' },
        ]}
        sx={{ mb: 3 }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Expiry Management</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:receipt-bold" />}
            onClick={() => setClearanceOpen(true)}
          >
            Record clearance cash
          </Button>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={selectedOutletId}
              label="Outlet"
              onChange={(e) => setSelectedOutletId(e.target.value)}
              disabled={!isOwner}
            >
              {outlets.map((o: any) => (
                <MenuItem key={o.id || o._id} value={o.id || o._id}>{o.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {tab === 'EXPIRED' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Expired lots are removed from sellable stock. If you sold them physically, record the cash here as a
          manual credit — it is not linked to a product or sale.
        </Alert>
      )}

      <Tabs 
        value={tab} 
        onChange={(_, v) => setTab(v)} 
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="EXPIRING_SOON" label="Expiring Soon" />
        <Tab value="EXPIRED" label="Expired Items" />
      </Tabs>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
            {loading ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Batch Received</TableCell>
                    <TableCell align="right">Qty Left</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Typography variant="subtitle2" className="sm-name">{item.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.sku}</Typography>
                      </TableCell>
                      <TableCell>{fDateTime(item.receivedAt)}</TableCell>
                      <TableCell align="right">{fNumber(item.remainingQty)}</TableCell>
                      <TableCell>
                        <Label variant="soft" color={tab === 'EXPIRED' ? 'error' : 'warning'}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </Label>
                      </TableCell>
                      <TableCell>
                        {tab === 'EXPIRED' ? (
                          <Typography variant="caption" color="error.main" fontWeight="bold">Expired</Typography>
                        ) : (
                          <Typography variant="caption" color="warning.main" fontWeight="bold">
                            In {item.daysToExpiry} days
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => { setEditItem(item); setNewExpiryDate(item.expiryDate.split('T')[0]); }}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography color="text.secondary">No items found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} fullWidth maxWidth="xs">
        <DialogTitle>Update Expiry Date</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" className="sm-name" sx={{ mb: 2 }}>{editItem?.productName}</Typography>
            <TextField
              fullWidth
              label="New Expiry Date"
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)} color="inherit">Cancel</Button>
          <LoadingButton variant="contained" loading={submitting} onClick={handleUpdateExpiry}>Update</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={clearanceOpen} onClose={() => setClearanceOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Record clearance cash (off-record)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Use this when expired stock is sold outside tracked POS. Cash is posted as a manual adjustment —
              not tied to inventory lots or sales.
            </Typography>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={clearance.amount}
              onChange={(e) => setClearance({ ...clearance, amount: e.target.value })}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment method</InputLabel>
              <Select
                label="Payment method"
                value={clearance.paymentMethod}
                onChange={(e) => setClearance({ ...clearance, paymentMethod: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank">Bank</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              minRows={2}
              value={clearance.description}
              onChange={(e) => setClearance({ ...clearance, description: e.target.value.slice(0, 500) })}
              helperText={`${clearance.description.trim().length}/500 (min 10 characters)`}
              error={
                clearance.description.length > 0 && clearance.description.trim().length < 10
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearanceOpen(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton variant="contained" loading={submitting} onClick={handleClearance}>
            Record credit
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}