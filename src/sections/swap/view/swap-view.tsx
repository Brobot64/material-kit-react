import type { Swap, SwapStatus, CreateSwapPayload, TradeInCondition } from 'src/types/swap';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { api } from 'src/services/api';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/contexts/auth-context';
import { useAppSnackbar } from 'src/contexts/snackbar-context';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<SwapStatus, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const CONDITIONS: { value: TradeInCondition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

// ----------------------------------------------------------------------

type CreateSwapDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function CreateSwapDialog({ open, onClose, onCreated }: CreateSwapDialogProps) {
  const { appData, outlets } = useAuth();
  const { showSuccess, showError } = useAppSnackbar();
  const [loading, setLoading] = useState(false);

  const [outletId, setOutletId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productOutlets, setProductOutlets] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState({
    newProductId: '',
    newProductQty: 1,
    newProductUnitPrice: 0,
    tradeInName: '',
    tradeInDescription: '',
    tradeInCondition: 'good' as TradeInCondition,
    tradeInEstimatedValue: 0,
    tradeInAcceptedValue: 0,
    tradeInNotes: '',
    notes: '',
  });

  const businessId = appData?.businessId || '';

  useEffect(() => {
    if (outlets.length > 0 && !outletId) {
      setOutletId(outlets[0]._id);
    }
  }, [outlets, outletId]);

  const fetchProducts = useCallback(async () => {
    if (!outletId) return;
    setLoadingProducts(true);
    try {
      const res = await api.getProductOutlets({ outletId, limit: 100, search: productSearch });
      setProductOutlets(res.data || []);
    } catch {
      // silent
    } finally {
      setLoadingProducts(false);
    }
  }, [outletId, productSearch]);

  useEffect(() => {
    if (open) fetchProducts();
  }, [open, fetchProducts]);

  const selectedProduct = productOutlets.find((p) => {
    const pid = typeof p.productId === 'object' ? p.productId._id : p.productId;
    return pid === form.newProductId;
  });

  const productValue = form.newProductQty * form.newProductUnitPrice;
  const cashDelta = productValue - form.tradeInAcceptedValue;

  const handleSubmit = async () => {
    if (!form.newProductId || !form.tradeInName) {
      showError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.createSwap({
        businessId,
        outletId,
        tradeIn: {
          productName: form.tradeInName,
          description: form.tradeInDescription || undefined,
          condition: form.tradeInCondition,
          estimatedValue: form.tradeInEstimatedValue,
          acceptedValue: form.tradeInAcceptedValue,
          notes: form.tradeInNotes || undefined,
        },
        newProductId: form.newProductId,
        newProductQty: form.newProductQty,
        newProductUnitPrice: form.newProductUnitPrice,
        notes: form.notes || undefined,
      });
      showSuccess('Swap created successfully');
      onCreated();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to create swap');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>New Swap</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Outlet</InputLabel>
            <Select value={outletId} label="Outlet" onChange={(e) => setOutletId(e.target.value)}>
              {outlets.map((o) => (
                <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" color="text.secondary">Trade-In Item</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Product Name *"
              value={form.tradeInName}
              onChange={set('tradeInName')}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Condition *</InputLabel>
              <Select
                value={form.tradeInCondition}
                label="Condition *"
                onChange={(e) => setForm((p) => ({ ...p, tradeInCondition: e.target.value as TradeInCondition }))}
              >
                {CONDITIONS.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Estimated Value"
              type="number"
              value={form.tradeInEstimatedValue}
              onChange={set('tradeInEstimatedValue')}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Accepted Value *"
              type="number"
              value={form.tradeInAcceptedValue}
              onChange={set('tradeInAcceptedValue')}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
          </Stack>
          <TextField
            fullWidth
            label="Trade-in description / notes"
            value={form.tradeInDescription}
            onChange={set('tradeInDescription')}
            size="small"
            multiline
            rows={2}
          />

          <Typography variant="subtitle2" color="text.secondary">New Product</Typography>
          <TextField
            fullWidth
            label="Search product"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            size="small"
            onBlur={fetchProducts}
            InputProps={{
              endAdornment: loadingProducts ? <CircularProgress size={16} /> : null,
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Select Product *</InputLabel>
            <Select
              value={form.newProductId}
              label="Select Product *"
              onChange={(e) => {
                const po = productOutlets.find((p) => {
                  const pid = typeof p.productId === 'object' ? p.productId._id : p.productId;
                  return pid === e.target.value;
                });
                setForm((prev) => ({
                  ...prev,
                  newProductId: e.target.value,
                  newProductUnitPrice: po?.defaultSalePrice || po?.sellingPrice || 0,
                }));
              }}
            >
              {productOutlets.map((po) => {
                const product = typeof po.productId === 'object' ? po.productId : { _id: po.productId, name: 'Unknown' };
                return (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} {product.sku ? `(${product.sku})` : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Quantity *"
              type="number"
              value={form.newProductQty}
              onChange={set('newProductQty')}
              size="small"
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Unit Price *"
              type="number"
              value={form.newProductUnitPrice}
              onChange={set('newProductUnitPrice')}
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
          </Stack>

          <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">New product value</Typography>
              <Typography variant="body2">{fCurrency(productValue)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Trade-in credit</Typography>
              <Typography variant="body2" color="success.main">- {fCurrency(form.tradeInAcceptedValue)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="subtitle2">
                {cashDelta >= 0 ? 'Customer pays' : 'Store credits'}
              </Typography>
              <Typography variant="subtitle2" color={cashDelta >= 0 ? 'primary' : 'success.main'}>
                {fCurrency(Math.abs(cashDelta))}
              </Typography>
            </Stack>
          </Card>

          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={set('notes')}
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Create Swap'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function SwapView() {
  const { appData } = useAuth();
  const { showSuccess, showError } = useAppSnackbar();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SwapStatus | ''>('');

  const businessId = appData?.businessId || '';

  const fetchSwaps = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await api.getSwaps({
        businessId,
        status: statusFilter || undefined,
      });
      setSwaps(res.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load swaps');
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter, showError]);

  useEffect(() => {
    fetchSwaps();
  }, [fetchSwaps]);

  const handleComplete = async (id: string) => {
    try {
      await api.completeSwap(id);
      showSuccess('Swap marked as completed');
      fetchSwaps();
    } catch (err: any) {
      showError(err.message || 'Failed to complete swap');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelSwap(id);
      showSuccess('Swap cancelled');
      fetchSwaps();
    } catch (err: any) {
      showError(err.message || 'Failed to cancel swap');
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Swaps</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setDialogOpen(true)}
        >
          New Swap
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {(['', 'pending', 'completed', 'cancelled'] as const).map((s) => (
          <Chip
            key={s}
            label={s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            color={s === statusFilter ? 'primary' : 'default'}
            variant={s === statusFilter ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter(s)}
            size="small"
          />
        ))}
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : swaps.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Iconify icon="solar:cart-3-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No swaps found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Swap #</TableCell>
                  <TableCell>Trade-In</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Accepted Value</TableCell>
                  <TableCell>Cash Delta</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {swaps.map((swap) => (
                  <TableRow key={swap._id} hover>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace">
                        {swap.swapNumber || swap._id.slice(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {swap.tradeIn.productName}
                      </Typography>
                      {swap.tradeIn.description && (
                        <Typography variant="caption" color="text.secondary">
                          {swap.tradeIn.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={swap.tradeIn.condition}
                        size="small"
                        variant="outlined"
                        color={
                          swap.tradeIn.condition === 'excellent' ? 'success' :
                          swap.tradeIn.condition === 'good' ? 'info' :
                          swap.tradeIn.condition === 'fair' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{fCurrency(swap.tradeIn.acceptedValue)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={swap.cashDelta >= 0 ? 'primary.main' : 'success.main'}
                        fontWeight={500}
                      >
                        {swap.cashDelta >= 0 ? '+' : '-'}{fCurrency(Math.abs(swap.cashDelta))}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {swap.cashDelta >= 0 ? 'customer pays' : 'store credits'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={swap.status}
                        size="small"
                        color={STATUS_COLORS[swap.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fDate(swap.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {swap.status === 'pending' && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button size="small" color="success" onClick={() => handleComplete(swap._id)}>
                            Complete
                          </Button>
                          <Button size="small" color="error" onClick={() => handleCancel(swap._id)}>
                            Cancel
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <CreateSwapDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={fetchSwaps}
      />
    </Box>
  );
}
