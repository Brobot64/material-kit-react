import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { fDateTime } from 'src/utils/format-time';
import { formatError } from 'src/utils/format-error';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { NumericInput } from 'src/components/numeric-input';

// ----------------------------------------------------------------------

const MOVEMENT_TYPE_COLOR: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  purchase: 'success',
  sale: 'error',
  transfer_in: 'info',
  transfer_out: 'warning',
  adjustment: 'warning',
  damage: 'error',
  return_customer: 'info',
  return_supplier: 'success',
};

export function InventoryView() {
  const { outlets, appData } = useAuth();
  const isOwner = appData?.role === 'owner';
  const isStoreExec = appData?.role === 'outlet_admin' || appData?.role === 'store_executive';
  const assignedOutletId = appData?.outletId;
  const businessId = appData?.businessId;

  const [tab, setTab] = useState(0);
  const [selectedOutletId, setSelectedOutletId] = useState(
    isOwner ? (outlets[0]?.id || '') : (assignedOutletId || '')
  );

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(isOwner ? outlets[0].id : (assignedOutletId || outlets[0].id));
    }
  }, [outlets, selectedOutletId, isOwner, assignedOutletId]);

  // Stock movements list
  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movPage, setMovPage] = useState(0);
  const [movLimit, setMovLimit] = useState(10);
  const [movTotal, setMovTotal] = useState(0);

  // Products for outlet (for receive/adjust)
  const [products, setProducts] = useState<any[]>([]);

  // Receive stock dialog
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveForm, setReceiveForm] = useState({
    productId: '',
    quantity: 0,
    unitCost: 0,
    notes: '',
  });

  // Adjust stock dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    quantity: 0,
    type: 'adjustment' as 'adjustment' | 'damage',
    reasonCode: '',
    notes: '',
    unitCost: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchMovements = useCallback(async () => {
    if (!businessId) return;
    setLoadingMovements(true);
    try {
      const response = await api.getStockMovements({
        businessId,
        outletId: selectedOutletId || undefined,
        page: movPage + 1,
        limit: movLimit,
      });
      setMovements(response.data || []);
      setMovTotal(response.pagination?.total || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load movements', severity: 'error' });
    } finally {
      setLoadingMovements(false);
    }
  }, [businessId, selectedOutletId, movPage, movLimit]);

  const fetchProducts = useCallback(async () => {
    if (!selectedOutletId) return;
    try {
      const response = await api.getProductOutlets({ outletId: selectedOutletId, limit: 200 });
      setProducts(response?.data || response?.results || []);
    } catch {
      // non-critical
    }
  }, [selectedOutletId]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleReceiveStock = async () => {
    if (!receiveForm.productId || receiveForm.quantity <= 0) return;
    setSubmitting(true);
    try {
      await api.receiveStock({
        businessId: businessId!,
        outletId: selectedOutletId,
        productId: receiveForm.productId,
        quantity: receiveForm.quantity,
        unitCost: receiveForm.unitCost,
        notes: receiveForm.notes,
      });
      setSnackbar({ open: true, message: 'Stock received successfully', severity: 'success' });
      setReceiveOpen(false);
      setReceiveForm({ productId: '', quantity: 0, unitCost: 0, notes: '' });
      fetchMovements();
      fetchProducts();
    } catch (error: any) {
      setSnackbar({ open: true, message: formatError(error), severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustForm.productId || !adjustForm.reasonCode.trim()) return;
    setSubmitting(true);
    try {
      await api.adjustStock({
        businessId: businessId!,
        outletId: selectedOutletId,
        productId: adjustForm.productId,
        quantity: Math.abs(adjustForm.quantity),
        type: adjustForm.type,
        reasonCode: adjustForm.reasonCode,
        notes: adjustForm.notes,
        unitCost: adjustForm.unitCost,
      });
      setSnackbar({ open: true, message: 'Stock adjusted successfully', severity: 'success' });
      setAdjustOpen(false);
      setAdjustForm({ productId: '', quantity: 0, type: 'adjustment', reasonCode: '', notes: '', unitCost: 0 });
      fetchMovements();
      fetchProducts();
    } catch (error: any) {
      setSnackbar({ open: true, message: formatError(error), severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Inventory' }]} sx={{ mb: 3 }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Inventory</Typography>
        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={selectedOutletId}
              label="Outlet"
              onChange={(e) => setSelectedOutletId(e.target.value)}
              disabled={!isOwner}
            >
              {outlets.map((o: any) => (
                <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setReceiveOpen(true)}
            disabled={!selectedOutletId}
          >
            Receive Stock
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Iconify icon="solar:settings-bold-duotone" />}
            onClick={() => setAdjustOpen(true)}
            disabled={!selectedOutletId}
          >
            Adjust Stock
          </Button>
        </Stack>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Stock Levels" />
        <Tab label="Movement History" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">On Hand</TableCell>
                    <TableCell align="right">Reserved</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No products at this outlet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => {
                      const qty = p.quantity ?? p.quantityOnHand ?? 0;
                      const avail = p.availableQuantity ?? qty;
                      const minStock = p.minStock ?? 0;
                      const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= minStock ? 'LOW_STOCK' : 'IN_STOCK';
                      const avgCost = p.averageCost ?? p.currentCost ?? 0;
                      return (
                        <TableRow key={p._id || p.productId?._id}>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {p.name || p.productId?.name || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.sku || p.productId?.sku || p.productId?.barcode || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{fNumber(qty)}</TableCell>
                          <TableCell align="right">{fNumber(p.reservedQuantity ?? 0)}</TableCell>
                          <TableCell align="right">{fNumber(avail)}</TableCell>
                          <TableCell align="right">{fCurrency(avgCost)}</TableCell>
                          <TableCell align="right">{fCurrency(qty * avgCost)}</TableCell>
                          <TableCell>
                            <Label
                              variant="soft"
                              color={status === 'IN_STOCK' ? 'success' : status === 'LOW_STOCK' ? 'warning' : 'error'}
                            >
                              {status.replace('_', ' ')}
                            </Label>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      )}

      {tab === 1 && (
        <>
          <Card>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Cost</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingMovements ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j}><Skeleton animation="wave" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <Typography color="text.secondary">No movements recorded yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((m) => (
                        <TableRow key={m._id}>
                          <TableCell>{fDateTime(m.createdAt)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {m.productId?.name || m.productId || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Label variant="soft" color={MOVEMENT_TYPE_COLOR[m.type] || 'default'}>
                              {m.type?.replace('_', ' ').toUpperCase()}
                            </Label>
                          </TableCell>
                          <TableCell align="right">{fNumber(m.quantity)}</TableCell>
                          <TableCell align="right">{fCurrency(m.unitCost)}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {m.referenceType || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {m.reasonCode || m.notes || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
          <TablePagination
            component="div"
            count={movTotal}
            page={movPage}
            rowsPerPage={movLimit}
            onPageChange={(_, p) => setMovPage(p)}
            onRowsPerPageChange={(e) => { setMovLimit(parseInt(e.target.value, 10)); setMovPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </>
      )}

      {/* Receive Stock Dialog */}
      <Dialog open={receiveOpen} onClose={() => setReceiveOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Receive Stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              select fullWidth required
              label="Product"
              value={receiveForm.productId}
              onChange={(e) => setReceiveForm({ ...receiveForm, productId: e.target.value })}
            >
              {products.map((p) => (
                <MenuItem key={p._id || p.productId?._id} value={p._id || p.productId?._id}>
                  {p.name || p.productId?.name}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <NumericInput
                  fullWidth required
                  label="Quantity Received"
                  value={receiveForm.quantity}
                  onChangeValue={(val) => setReceiveForm({ ...receiveForm, quantity: val })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <NumericInput
                  fullWidth
                  label="Unit Cost (₦)"
                  value={receiveForm.unitCost}
                  onChangeValue={(val) => setReceiveForm({ ...receiveForm, unitCost: val })}
                  InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth multiline rows={2}
              label="Notes (Optional)"
              value={receiveForm.notes}
              onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveOpen(false)} color="inherit">Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={submitting}
            onClick={handleReceiveStock}
            disabled={!receiveForm.productId || receiveForm.quantity <= 0}
          >
            Receive
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>

            <Autocomplete
              fullWidth
              options={products}
              getOptionLabel={(option) => option.name || option.productId?.name || ""}

              isOptionEqualToValue={(option, value) => {
                const optionId = option._id || option.productId?._id;
                const valueId = value._id || value.productId?._id;
                return optionId === valueId;
              }}

              value={
                products.find((p) => {
                  const id = p._id || p.productId?._id;
                  return id === adjustForm.productId;
                }) || null
              }

              onChange={(event, newValue) => {
                const selectedId = newValue ? (newValue._id || newValue.productId?._id) : '';
                setAdjustForm({
                  ...adjustForm,
                  productId: selectedId,
                  unitCost: newValue ? (newValue.floorPrice ?? newValue.price ?? 0) : 0, // prefill unit cost if product selected
                });

              }}

              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  required
                />
              )}
            />

            <TextField
              select fullWidth
              label="Adjustment Type"
              value={adjustForm.type}
              onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
            >
              <MenuItem value="adjustment">Manual Adjustment</MenuItem>
              <MenuItem value="damage">Damage / Write-off</MenuItem>
            </TextField>

            <NumericInput
              fullWidth
              label="Quantity Change (positive = add, negative = remove)"
              value={adjustForm.quantity}
              onChangeValue={(val) => setAdjustForm({ ...adjustForm, quantity: val })}
            />

            <NumericInput
              fullWidth
              label="Unit Cost (₦)"
              value={adjustForm.unitCost}
              onChangeValue={(val) => setAdjustForm({ ...adjustForm, unitCost: val })}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />

            {/* <TextField
              fullWidth required
              label="Reason Code"
              placeholder="e.g. DAMAGED, EXPIRED, COUNT_CORRECTION"
              value={adjustForm.reasonCode}
              onChange={(e) => setAdjustForm({ ...adjustForm, reasonCode: e.target.value })}
            /> */}

            <TextField
              select
              fullWidth
              required
              label="Reason Code"
              value={adjustForm.reasonCode}
              onChange={(e) => setAdjustForm({ ...adjustForm, reasonCode: e.target.value })}
            >
              {Object.keys(MOVEMENT_TYPE_COLOR).map((key) => (
                <MenuItem key={key} value={key}>
                  {/* This formats 'transfer_in' to 'TRANSFER IN' for better readability */}
                  {key.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth multiline rows={2}
              label="Notes"
              value={adjustForm.notes}
              onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustOpen(false)} color="inherit">Cancel</Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={submitting}
            onClick={handleAdjustStock}
            disabled={!adjustForm.productId || !adjustForm.reasonCode.trim()}
          >
            Adjust
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}
