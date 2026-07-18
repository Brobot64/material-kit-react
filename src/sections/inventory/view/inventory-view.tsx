import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
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
import { useOffline } from 'src/offline';
import { appPanelSx } from 'src/theme/app-surface';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PageHeader } from 'src/components/page-header';
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
  const { getOfflineProductOutlets, mutate, status: offlineStatus } = useOffline();
  const isOwner = appData?.role === 'owner';
  const assignedOutletId = appData?.outletId;
  const businessId = appData?.businessId;
  
  const enableExpiry = useMemo(() => {
    const features = appData?.businessSettings?.features || appData?.features;
    return Boolean(features?.enableExpiryTracking);
  }, [appData]);


  const [tab, setTab] = useState(0);
  const [selectedOutletId, setSelectedOutletId] = useState('');

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      const initialId = assignedOutletId || outlets[0].id || outlets[0]._id;
      if (initialId) setSelectedOutletId(initialId);
    }
  }, [outlets, assignedOutletId, selectedOutletId]);

  // Stock movements pagination
  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movPage, setMovPage] = useState(0);
  const [movLimit, setMovLimit] = useState(10);
  const [movTotal, setMovTotal] = useState(0);

  // Stock levels (ProductOutlet) pagination
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [prodPage, setProdPage] = useState(0);
  const [prodLimit, setProdLimit] = useState(10);
  const [prodTotal, setProdTotal] = useState(0);

  // Dialog states
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ productId: '', quantity: 0, unitCost: 0, notes: '', expiryDate: '' });

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '', quantity: 0, type: 'adjustment' as 'adjustment' | 'damage',
    reasonCode: '', notes: '', unitCost: 0,
  });

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    productId: '',
    toOutletId: '',
    quantity: 0,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);

  const fetchDiscrepancies = useCallback(async () => {
    if (!selectedOutletId || !navigator.onLine) return;
    try {
      const res = await api.getStockDiscrepancies({
        outletId: selectedOutletId,
        status: 'open',
      });
      setDiscrepancies(res.data || []);
    } catch {
      setDiscrepancies([]);
    }
  }, [selectedOutletId]);

  const fetchMovements = useCallback(async () => {
    if (!businessId) return;
    setLoadingMovements(true);
    try {
      const res = await api.getStockMovements({
        businessId, outletId: selectedOutletId || undefined,
        page: movPage + 1, limit: movLimit,
      });
      setMovements(res.data || []);
      setMovTotal(res.pagination?.total || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load movements', severity: 'error' });
    } finally { setLoadingMovements(false); }
  }, [businessId, selectedOutletId, movPage, movLimit]);

  const fetchProducts = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoadingProducts(true);
    try {
      const res = await api.getProductOutlets({
        outletId: selectedOutletId,
        page: prodPage + 1,
        limit: prodLimit,
      });
      const data = res?.results || res?.data || [];
      setProducts(data);
      setProdTotal(res?.pagination?.total || data.length);
    } catch {
      const cached = await getOfflineProductOutlets({
        outletId: selectedOutletId,
        limit: prodLimit,
      });
      if (cached.length) {
        setProducts(cached as any[]);
        setProdTotal(cached.length);
      } else {
        setSnackbar({ open: true, message: 'Failed to load products', severity: 'error' });
      }
    } finally { setLoadingProducts(false); }
  }, [selectedOutletId, prodPage, prodLimit, getOfflineProductOutlets]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchDiscrepancies(); }, [fetchDiscrepancies]);

  useEffect(() => { setProdPage(0); setMovPage(0); }, [selectedOutletId]);

  const syncStale =
    typeof offlineStatus.lastSyncedAt === 'number' &&
    Date.now() - offlineStatus.lastSyncedAt > 6 * 60 * 60 * 1000;

  const handleReceiveStock = async () => {
    if (!receiveForm.productId || receiveForm.quantity <= 0) return;
    setSubmitting(true);
    try {
      if (!offlineStatus.online || !navigator.onLine) {
        const intentId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `recv-${Date.now()}`;
        await mutate({
          collection: 'stock_intents',
          entityId: intentId,
          patch: {
            kind: 'receive',
            businessId,
            outletId: selectedOutletId,
            productId: receiveForm.productId,
            quantity: receiveForm.quantity,
            unitCost: receiveForm.unitCost,
            notes: receiveForm.notes,
            expiryDate: receiveForm.expiryDate || undefined,
            _pending: true,
            clientIntentId: intentId,
            createdAt: new Date().toISOString(),
          },
        });
        setSnackbar({
          open: true,
          message: 'Receive queued offline — will sync when back online',
          severity: 'warning',
        });
        setReceiveOpen(false);
        setReceiveForm({ productId: '', quantity: 0, unitCost: 0, notes: '', expiryDate: '' });
        return;
      }

      await api.receiveStock({
        businessId: businessId!, outletId: selectedOutletId,
        productId: receiveForm.productId, quantity: receiveForm.quantity,
        unitCost: receiveForm.unitCost, notes: receiveForm.notes,
        expiryDate: receiveForm.expiryDate || undefined
      });
      setSnackbar({ open: true, message: 'Stock received successfully', severity: 'success' });
      setReceiveOpen(false);
      setReceiveForm({ productId: '', quantity: 0, unitCost: 0, notes: '', expiryDate: '' });
      fetchMovements(); fetchProducts(); fetchDiscrepancies();
    } catch (e: any) { setSnackbar({ open: true, message: formatError(e), severity: 'error' }); }
    finally { setSubmitting(false); }
  };

  const handleTransferStock = async () => {
    if (!transferForm.productId || !transferForm.toOutletId || transferForm.quantity <= 0) return;
    if (transferForm.toOutletId === selectedOutletId) {
      setSnackbar({ open: true, message: 'Pick a different destination outlet', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      if (!offlineStatus.online || !navigator.onLine) {
        const intentId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `xfer-${Date.now()}`;
        await mutate({
          collection: 'stock_intents',
          entityId: intentId,
          patch: {
            kind: 'transfer',
            businessId,
            fromOutletId: selectedOutletId,
            toOutletId: transferForm.toOutletId,
            productId: transferForm.productId,
            quantity: transferForm.quantity,
            notes: transferForm.notes || undefined,
            _pending: true,
            clientIntentId: intentId,
            createdAt: new Date().toISOString(),
          },
        });
        setSnackbar({
          open: true,
          message: 'Transfer queued offline — will sync when back online',
          severity: 'warning',
        });
        setTransferOpen(false);
        setTransferForm({ productId: '', toOutletId: '', quantity: 0, notes: '' });
        return;
      }

      await api.transferStock({
        businessId: businessId!,
        fromOutletId: selectedOutletId,
        toOutletId: transferForm.toOutletId,
        productId: transferForm.productId,
        quantity: transferForm.quantity,
        notes: transferForm.notes || undefined,
      });
      setSnackbar({ open: true, message: 'Stock transferred successfully', severity: 'success' });
      setTransferOpen(false);
      setTransferForm({ productId: '', toOutletId: '', quantity: 0, notes: '' });
      fetchMovements();
      fetchProducts();
      fetchDiscrepancies();
    } catch (e: any) {
      setSnackbar({ open: true, message: formatError(e), severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDiscrepancy = async (id: string) => {
    try {
      await api.resolveStockDiscrepancy(id, { notes: 'Resolved from inventory' });
      setSnackbar({ open: true, message: 'Discrepancy resolved', severity: 'success' });
      fetchDiscrepancies();
    } catch (e: any) {
      setSnackbar({ open: true, message: formatError(e), severity: 'error' });
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustForm.productId || !adjustForm.reasonCode.trim()) return;
    setSubmitting(true);
    try {
      await api.adjustStock({
        businessId: businessId!, outletId: selectedOutletId,
        productId: adjustForm.productId, quantity: Math.abs(adjustForm.quantity),
        type: adjustForm.type, reasonCode: adjustForm.reasonCode,
        notes: adjustForm.notes, unitCost: adjustForm.unitCost,
      });
      setSnackbar({ open: true, message: 'Stock adjusted successfully', severity: 'success' });
      setAdjustOpen(false);
      setAdjustForm({ productId: '', quantity: 0, type: 'adjustment', reasonCode: '', notes: '', unitCost: 0 });
      fetchMovements(); fetchProducts();
    } catch (e: any) { setSnackbar({ open: true, message: formatError(e), severity: 'error' }); }
    finally { setSubmitting(false); }
  };

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Inventory' }]} sx={{ mb: 2 }} />

      <PageHeader
        kicker="Stock"
        title="Inventory"
        subtitle="Quantities, valuations, and stock movements by outlet."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: { xs: 1, sm: 160 } }}>
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
            <Button variant="outlined" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setReceiveOpen(true)} disabled={!selectedOutletId}>Receive Stock</Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={() => setTransferOpen(true)}
              disabled={!selectedOutletId || outlets.length < 2}
            >
              Transfer
            </Button>
            <Button variant="outlined" color="warning" startIcon={<Iconify icon="solar:settings-bold-duotone" />} onClick={() => setAdjustOpen(true)} disabled={!selectedOutletId}>Adjust Stock</Button>
          </Stack>
        }
      />

      {(syncStale || offlineStatus.pendingOps > 0 || !offlineStatus.online) && (
        <Alert severity={offlineStatus.online ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {!offlineStatus.online
            ? 'Offline — stock receive/transfer will queue and sync when you reconnect.'
            : syncStale
              ? `Catalog sync looks stale (last synced ${fDateTime(offlineStatus.lastSyncedAt)}). Refresh or check the network.`
              : `${offlineStatus.pendingOps} change(s) waiting to sync.`}
        </Alert>
      )}

      {discrepancies.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            isOwner || appData?.role === 'outlet_admin' || appData?.role === 'store_executive' ? (
              <Button color="inherit" size="small" onClick={() => handleResolveDiscrepancy(discrepancies[0]._id)}>
                Resolve first
              </Button>
            ) : undefined
          }
        >
          {discrepancies.length} open stock discrepanc{discrepancies.length === 1 ? 'y' : 'ies'} for this
          outlet — sync/merge would have gone negative. Review before more transfers.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Stock Levels" />
        <Tab label="Movement History" />
      </Tabs>

      {tab === 0 && (
        <>
          <Card sx={appPanelSx}>
            <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 } }}>
              <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.75 }}>
                Levels
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontFamily: (t) => t.typography.fontSecondaryFamily, fontWeight: 700, mb: 2 }}
              >
                Stock levels
              </Typography>
            </Box>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">On Hand</TableCell>
                      <TableCell align="right">Available</TableCell>
                      <TableCell align="right">Avg Cost</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingProducts ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                      ))
                    ) : products.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><Typography color="text.secondary">No products found</Typography></TableCell></TableRow>
                    ) : (
                      products.map((p) => {
                        const outlet = p.outlets?.find((o: any) => {
                          const oId = typeof o.outletId === 'object' ? o.outletId?._id || o.outletId?.id : o.outletId;
                          return oId === selectedOutletId;
                        }) || p.outlets?.[0];
                        const qty = outlet?.quantity ?? p.quantity ?? p.quantityOnHand ?? 0;
                        const avgCost = outlet?.averageCost ?? outlet?.currentCost ?? p.averageCost ?? p.currentCost ?? 0;
                        const minStock = outlet?.minStock ?? p.minStock ?? 0;
                        const status = qty <= 0 ? 'OUT_OF_STOCK' : qty <= minStock ? 'LOW_STOCK' : 'IN_STOCK';
                        return (
                          <TableRow key={p._id || p.productId?._id}>
                            <TableCell>
                              <Typography variant="subtitle2" noWrap className="sm-name">{p.name || p.productId?.name || '—'}</Typography>
                              <Typography variant="caption" color="text.secondary">{p.sku || p.productId?.sku || '—'}</Typography>
                            </TableCell>
                            <TableCell align="right">{fNumber(qty)}</TableCell>
                            <TableCell align="right">{fNumber(outlet?.availableQuantity ?? qty)}</TableCell>
                            <TableCell align="right">{fCurrency(avgCost)}</TableCell>
                            <TableCell align="right">{fCurrency(qty * avgCost)}</TableCell>
                            <TableCell><Label variant="soft" color={status === 'IN_STOCK' ? 'success' : status === 'LOW_STOCK' ? 'warning' : 'error'}>{status.replace('_', ' ')}</Label></TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
          <TablePagination component="div" count={prodTotal} page={prodPage} rowsPerPage={prodLimit}
            onPageChange={(_, p) => setProdPage(p)} onRowsPerPageChange={(e) => { setProdLimit(parseInt(e.target.value, 10)); setProdPage(0); }}
            rowsPerPageOptions={[10, 25, 50]} />
        </>
      )}

      {tab === 1 && (
        <>
          <Card sx={appPanelSx}>
            <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 } }}>
              <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.75 }}>
                History
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontFamily: (t) => t.typography.fontSecondaryFamily, fontWeight: 700, mb: 2 }}
              >
                Movement history
              </Typography>
            </Box>
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
                      {enableExpiry && <TableCell>Expiry</TableCell>}
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingMovements ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: enableExpiry ? 7 : 6 }).map((__, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                      ))
                    ) : movements.length === 0 ? (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><Typography color="text.secondary">No movements recorded yet</Typography></TableCell></TableRow>
                    ) : (
                      movements.map((m) => (
                        <TableRow key={m._id}>
                          <TableCell>{fDateTime(m.createdAt)}</TableCell>
                          <TableCell><Typography variant="body2" noWrap>{m.productId?.name || '—'}</Typography></TableCell>
                          <TableCell><Label variant="soft" color={MOVEMENT_TYPE_COLOR[m.type] || 'default'}>{m.type?.toUpperCase()}</Label></TableCell>
                          <TableCell align="right">{fNumber(m.quantity)}</TableCell>
                          <TableCell align="right">{fCurrency(m.unitCost)}</TableCell>
                          {enableExpiry && (
                            <TableCell>
                              {m.expiryDate ? (
                                <Label color={new Date(m.expiryDate) < new Date() ? 'error' : 'default'} variant="soft">
                                  {new Date(m.expiryDate).toLocaleDateString()}
                                </Label>
                              ) : '—'}
                            </TableCell>
                          )}
                          <TableCell><Typography variant="caption" color="text.secondary">{m.reasonCode || m.notes || '—'}</Typography></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
          <TablePagination component="div" count={movTotal} page={movPage} rowsPerPage={movLimit}
            onPageChange={(_, p) => setMovPage(p)} onRowsPerPageChange={(e) => { setMovLimit(parseInt(e.target.value, 10)); setMovPage(0); }}
            rowsPerPageOptions={[10, 25, 50]} />
        </>
      )}

      <Dialog open={receiveOpen} onClose={() => setReceiveOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Receive Stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Autocomplete fullWidth options={products} getOptionLabel={(o) => o.name || o.productId?.name || ""}
              value={products.find((p) => (p._id || p.productId?._id) === receiveForm.productId) || null}
              onChange={(_, v) => setReceiveForm({ ...receiveForm, productId: v ? (v._id || v.productId?._id) : '' })}
              renderInput={(p) => <TextField {...p} label="Product" required />} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><NumericInput fullWidth required label="Quantity" value={receiveForm.quantity} onChangeValue={(v) => setReceiveForm({ ...receiveForm, quantity: v })} /></Grid>
              <Grid size={{ xs: 6 }}><NumericInput fullWidth label="Unit Cost (₦)" value={receiveForm.unitCost} onChangeValue={(v) => setReceiveForm({ ...receiveForm, unitCost: v })} InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }} /></Grid>
            </Grid>
            
            {enableExpiry && (
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={receiveForm.expiryDate}
                onChange={(e) => setReceiveForm({ ...receiveForm, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            )}

            <TextField fullWidth multiline rows={2} label="Notes" value={receiveForm.notes} onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveOpen(false)} color="inherit">Cancel</Button>
          <LoadingButton variant="contained" loading={submitting} onClick={handleReceiveStock} disabled={!receiveForm.productId || receiveForm.quantity <= 0}>Receive</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              From: {outlets.find((o: any) => (o.id || o._id) === selectedOutletId)?.name || 'Selected outlet'}
            </Typography>
            <Autocomplete
              fullWidth
              options={products}
              getOptionLabel={(o) => o.name || o.productId?.name || ''}
              value={products.find((p) => (p._id || p.productId?._id) === transferForm.productId) || null}
              onChange={(_, v) =>
                setTransferForm({
                  ...transferForm,
                  productId: v ? v._id || v.productId?._id : '',
                })
              }
              renderInput={(p) => <TextField {...p} label="Product" required />}
            />
            <FormControl fullWidth required>
              <InputLabel>To outlet</InputLabel>
              <Select
                label="To outlet"
                value={transferForm.toOutletId}
                onChange={(e) => setTransferForm({ ...transferForm, toOutletId: e.target.value })}
              >
                {outlets
                  .filter((o: any) => (o.id || o._id) !== selectedOutletId)
                  .map((o: any) => (
                    <MenuItem key={o.id || o._id} value={o.id || o._id}>
                      {o.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <NumericInput
              fullWidth
              required
              label="Quantity"
              value={transferForm.quantity}
              onChangeValue={(v) => setTransferForm({ ...transferForm, quantity: v })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={transferForm.notes}
              onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="info"
            loading={submitting}
            onClick={handleTransferStock}
            disabled={
              !transferForm.productId || !transferForm.toOutletId || transferForm.quantity <= 0
            }
          >
            Transfer
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Autocomplete fullWidth options={products} getOptionLabel={(o) => o.name || o.productId?.name || ""}
              value={products.find((p) => (p._id || p.productId?._id) === adjustForm.productId) || null}
              onChange={(_, v) => {
                const outlet = v?.outlets?.find((o: any) => {
                  const oId = typeof o.outletId === 'object' ? o.outletId?._id || o.outletId?.id : o.outletId;
                  return oId === selectedOutletId;
                }) || v?.outlets?.[0];
                setAdjustForm({ ...adjustForm, productId: v ? (v._id || v.productId?._id) : '', unitCost: outlet ? (outlet.floorPrice ?? outlet.sellingPrice ?? 0) : 0 });
              }}
              renderInput={(p) => <TextField {...p} label="Product" required />} />
            <TextField select fullWidth label="Type" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}>
              <MenuItem value="adjustment">Manual Adjustment</MenuItem><MenuItem value="damage">Damage / Write-off</MenuItem>
            </TextField>
            <NumericInput fullWidth label="Quantity Change" value={adjustForm.quantity} onChangeValue={(v) => setAdjustForm({ ...adjustForm, quantity: v })} />
            <NumericInput fullWidth label="Unit Cost (₦)" value={adjustForm.unitCost} onChangeValue={(v) => setAdjustForm({ ...adjustForm, unitCost: v })} InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }} />
            <TextField select fullWidth required label="Reason" value={adjustForm.reasonCode} onChange={(e) => setAdjustForm({ ...adjustForm, reasonCode: e.target.value })}>
              {Object.keys(MOVEMENT_TYPE_COLOR).map((k) => (<MenuItem key={k} value={k}>{k.replace('_', ' ').toUpperCase()}</MenuItem>))}
            </TextField>
            <TextField fullWidth multiline rows={2} label="Notes" value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustOpen(false)} color="inherit">Cancel</Button>
          <LoadingButton variant="contained" color="warning" loading={submitting} onClick={handleAdjustStock} disabled={!adjustForm.productId || !adjustForm.reasonCode.trim()}>Adjust</LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}
