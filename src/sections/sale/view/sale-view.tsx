import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useOffline } from 'src/offline';
import { useAuth } from 'src/contexts/auth-context';
import { appPanelSx, appProductTileSx } from 'src/theme/app-surface';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PageHeader } from 'src/components/page-header';
import { NumericInput } from 'src/components/numeric-input';
import { ReceiptPreviewModal } from 'src/components/receipt-preview/ReceiptPreviewModal';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  guidePrice: number;
  floorPrice: number;
  tax: number;
  discount: number;
  stock: number;
  overrideReason?: string;
  pricingWarning?: string;
}

function getPricingLabel(item: CartItem): { label: string; color: any } {
  if (item.unitPrice > item.guidePrice) return { label: 'Above Guide', color: 'success' };
  if (item.unitPrice === item.guidePrice || item.unitPrice === 0) return { label: 'At Guide', color: 'default' };
  if (item.floorPrice > 0 && item.unitPrice < item.floorPrice) return { label: 'Below Floor', color: 'error' };
  return { label: 'Below Guide', color: 'warning' };
}

const OVERRIDE_REASON_MIN = 20;
const OVERRIDE_REASON_MAX = 200;

export function SaleView() {
  const { outlets, appData } = useAuth();
  const { status: offlineStatus, mutate, getOfflineCustomers, getOfflineProductOutlets } = useOffline();
  const isOwner = appData?.role === 'owner';
  const canApproveBelowFloor =
    appData?.role === 'owner' ||
    appData?.role === 'outlet_admin' ||
    appData?.role === 'store_executive' ||
    appData?.role === 'system_admin';
  const isSalesRep = appData?.role === 'sales_rep';
  const assignedOutletId = appData?.outletId;

  const [selectedOutletId, setSelectedOutletId] = useState<string>('');

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(assignedOutletId || outlets[0].id || outlets[0]._id);
    }
  }, [outlets, selectedOutletId, assignedOutletId]);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [resolvedCustomer, setResolvedCustomer] = useState<any>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [receiptModal, setReceiptModal] = useState({ open: false, saleId: '' });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.getCustomers({ limit: 100 });
      setCustomers(response.data || []);
    } catch {
      const cached = await getOfflineCustomers({ limit: 100 });
      if (cached.length) setCustomers(cached);
    }
  }, [getOfflineCustomers]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    const phone = customerPhone.replace(/\s/g, '');
    if (!phone) {
      if (!resolvedCustomer) setCustomerName('');
      return;
    }
    const found = customers.find((c) => (c.userId?.phone || c.phone)?.replace(/\s/g, '') === phone);      
    if (found) {
      setResolvedCustomer(found);
      setCustomerName(found.userId?.fullName || found.fullName || '');
    } else {
      setResolvedCustomer(null);
    }
  }, [customerPhone, customers, resolvedCustomer]);

  const fetchProducts = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoadingProducts(true);
    try {
      const response = await api.getProductOutlets({
        outletId: selectedOutletId,
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
      });
      const data = response?.results || response?.data || [];
      setProducts(data);
      setTotalProducts(response?.pagination?.total || data.length);
    } catch {
      const cached = await getOfflineProductOutlets({
        outletId: selectedOutletId,
        search: debouncedSearch,
        limit: rowsPerPage,
      });
      if (cached.length) {
        setProducts(cached);
        setTotalProducts(cached.length);
      } else {
        setSnackbar({ open: true, message: 'Failed to fetch products', severity: 'error' });
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedOutletId, page, rowsPerPage, debouncedSearch, getOfflineProductOutlets]);

  useEffect(() => { setPage(0); }, [selectedOutletId, debouncedSearch]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToCart = (product: any) => {
    const productId = product._id || product.productId?._id;
    const outlet = product.outlets?.find((o: any) => {
      const oId = typeof o.outletId === 'object' ? o.outletId?._id || o.outletId?.id : o.outletId;
      return oId === selectedOutletId;
    }) || product.outlets?.[0];
    const stock = outlet?.availableQuantity ?? outlet?.quantity ?? product.availableQuantity ?? product.quantity ?? 0;
    if (stock <= 0) return;
    
    const existing = cart.find((i) => i.productId === productId);
    if (existing) {
      if (existing.quantity >= stock) {
        setSnackbar({ open: true, message: 'Insufficient stock', severity: 'error' });
        return;
      }
      setCart(cart.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));       
    } else {
      const price = outlet?.defaultSalePrice ?? outlet?.guidePrice ?? outlet?.sellingPrice ?? product.defaultSalePrice ?? product.guidePrice ?? product.sellingPrice ?? 0;
      setCart([...cart, {
        productId,
        name: product.name || product.productId?.name || 'Unknown',
        quantity: 1,
        unitPrice: price,
        guidePrice: outlet?.guidePrice ?? price,
        floorPrice: outlet?.floorPrice ?? 0,
        tax: 0,
        discount: 0,
        stock,
      }]);
    }
  };

  const removeFromCart = (pid: string) => setCart(cart.filter((i) => i.productId !== pid));

  const updateQuantity = (pid: string, qty: number) => {
    if (qty <= 0) { removeFromCart(pid); return; }
    const item = cart.find((i) => i.productId === pid);
    if (item && qty > item.stock) {
      setSnackbar({ open: true, message: 'Exceeds stock', severity: 'error' });
      return;
    }
    setCart(cart.map((i) => i.productId === pid ? { ...i, quantity: qty } : i));
  };

  const updateUnitPrice = (pid: string, up: number) => {
    setCart(cart.map((i) => {
      if (i.productId !== pid) return i;
      // Sales reps cannot go below floor — clamp instead of allowing override UI
      const clamped =
        isSalesRep && i.floorPrice > 0 && up < i.floorPrice ? i.floorPrice : up;
      const belowFloor = i.floorPrice > 0 && clamped < i.floorPrice;
      let warn: string | undefined;
      if (isSalesRep && up < i.floorPrice && i.floorPrice > 0) {
        warn = `Price cannot go below floor (\u20A6${i.floorPrice})`;
      } else if (belowFloor) warn = `Below floor (\u20A6${i.floorPrice})`;
      else if (clamped < i.guidePrice) warn = `Below guide (\u20A6${i.guidePrice})`;
      return {
        ...i,
        unitPrice: clamped,
        pricingWarning: warn,
        overrideReason: belowFloor && canApproveBelowFloor ? i.overrideReason : undefined,
      };
    }));
  };

  const updateOverrideReason = (pid: string, reason: string) => {
    setCart(cart.map((i) => (i.productId === pid ? { ...i, overrideReason: reason } : i)));
  };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const total = subtotal;
  const change = Math.max(0, amountPaid - total);

  useEffect(() => { if (paymentMethod !== 'credit') setAmountPaid(total); }, [total, paymentMethod]);     

  const handleSubmitSale = async () => {
    if (cart.length === 0) return;
    const hasCust = !!resolvedCustomer || (!!customerPhone && !!customerName);
    if (amountPaid < total && !hasCust) {
      setSnackbar({ open: true, message: 'Customer info required for credit', severity: 'error' });
      return;
    }
    if (isSalesRep) {
      const belowFloor = cart.filter((i) => i.floorPrice > 0 && i.unitPrice < i.floorPrice);
      if (belowFloor.length > 0) {
        setSnackbar({
          open: true,
          message: 'Sales representatives cannot sell below floor price.',
          severity: 'error',
        });
        return;
      }
    }

    const invalidFloorReasons = cart.filter((i) => {
      if (!(i.floorPrice > 0 && i.unitPrice < i.floorPrice)) return false;
      const len = i.overrideReason?.trim().length || 0;
      return len < OVERRIDE_REASON_MIN || len > OVERRIDE_REASON_MAX;
    });
    if (invalidFloorReasons.length > 0) {
      setSnackbar({
        open: true,
        message: `Below-floor reason must be ${OVERRIDE_REASON_MIN}–${OVERRIDE_REASON_MAX} characters: ${invalidFloorReasons.map((i) => i.name).join(', ')}`,
        severity: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const saleItems = cart.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        tax: i.tax,
        discount: i.discount,
        overrideReason: i.overrideReason,
      }));

      // Offline / failed-network path: queue sale in Dexie outbox
      if (!offlineStatus.online || !navigator.onLine) {
        const clientSaleId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `sale-${Date.now()}`;

        let cid = resolvedCustomer?.userId?._id || resolvedCustomer?.userId || resolvedCustomer?._id;
        if (!cid && customerPhone && customerName) {
          const localCustomerId =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `cust-${Date.now()}`;
          await mutate({
            collection: 'customers',
            entityId: localCustomerId,
            patch: {
              fullName: customerName,
              phone: customerPhone,
              _pending: true,
              clientCustomerId: localCustomerId,
            },
          });
          cid = localCustomerId;
        }

        await mutate({
          collection: 'sales',
          entityId: clientSaleId,
          patch: {
            clientSaleId,
            businessId: appData?.businessId,
            outletId: selectedOutletId,
            items: saleItems,
            paymentMethod,
            amountPaid,
            customerId: cid,
            notes,
            status: 'pending_sync',
            _pending: true,
            createdAt: new Date().toISOString(),
            total,
          },
        });

        // Optimistic local stock decrement for queued sale
        for (const item of cart) {
          const localRows = await getOfflineProductOutlets({
            outletId: selectedOutletId,
            limit: 500,
          });
          const match = localRows.find((row) => {
            const pid = String(
              (row as any).productId?._id ||
                (row as any).productId ||
                (row as any)._id ||
                (row as any).id ||
                ''
            );
            return pid === item.productId;
          });
          if (match) {
            const rowId = String((match as any).id || (match as any)._id);
            const qty = Number((match as any).availableQuantity ?? (match as any).quantity ?? 0);
            await mutate({
              collection: 'productOutlets',
              entityId: rowId,
              patch: {
                ...match,
                availableQuantity: Math.max(0, qty - item.quantity),
                quantity: Math.max(0, qty - item.quantity),
              },
            });
          }
        }

        setSnackbar({
          open: true,
          message: 'Sale saved offline — will sync when you are back online',
          severity: 'warning',
        });
        setCart([]);
        setAmountPaid(0);
        setCustomerPhone('');
        setCustomerName('');
        setResolvedCustomer(null);
        fetchProducts();
        return;
      }

      let cid = resolvedCustomer?.userId?._id || resolvedCustomer?.userId;
      if (!cid && customerPhone && customerName) {
        const created = await api.createCustomer({ fullName: customerName, phone: customerPhone });
        cid = created?.user?.id || created?.data?.user?.id;
      }
      const created = await api.createSale({
        businessId: appData?.businessId,
        outletId: selectedOutletId,
        items: saleItems,
        paymentMethod,
        amountPaid,
        customerId: cid,
        notes,
      });
      // Controller returns the sale document directly (201), sometimes wrapped as { data }
      const salePayload = (created as any)?.data ?? created;
      const saleId = String(salePayload?._id || salePayload?.id || '');
      setSnackbar({ open: true, message: 'Sale recorded', severity: 'success' });
      setCart([]);
      setAmountPaid(0);
      setCustomerPhone('');
      setCustomerName('');
      setResolvedCustomer(null);
      fetchProducts();
      if (saleId) {
        setReceiptModal({ open: true, saleId });
      }
    } catch (e: any) {
      // Network failure mid-submit → queue offline
      if (!navigator.onLine || e?.message?.includes('Failed to fetch') || e?.status === 0) {
        setSnackbar({
          open: true,
          message: 'Network unavailable — try again or check offline banner for queued sales',
          severity: 'error',
        });
      } else {
        setSnackbar({ open: true, message: formatError(e), severity: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <PageHeader
        kicker="Point of sale"
        title="New sale"
        subtitle="Search products, build a cart, and checkout — works online or offline."
        action={
          <FormControl sx={{ minWidth: { xs: 1, sm: 200 } }} size="small">
            <InputLabel>Outlet</InputLabel>
            <Select value={selectedOutletId} label="Outlet" onChange={(e) => setSelectedOutletId(e.target.value)} disabled={!isOwner}>
              {outlets.map((o: any) => <MenuItem key={o.id || o._id} value={o.id || o._id}>{o.name}</MenuItem>)}
            </Select>
          </FormControl>
        }
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={[{ p: { xs: 2, sm: 2.5 }, height: '100%' }, appPanelSx]}>
            <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1.5 }}>
              Catalog
            </Typography>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Scrollbar sx={{ maxHeight: { xs: 360, md: 560 } }}>
              <Grid container spacing={1.5}>
                {loadingProducts ? (
                  <CircularProgress sx={{ mx: 'auto', my: 5 }} />
                ) : (
                  products.map((p) => {
                    const outlet =
                      p.outlets?.find((o: any) => {
                        const oId =
                          typeof o.outletId === 'object'
                            ? o.outletId?._id || o.outletId?.id
                            : o.outletId;
                        return oId === selectedOutletId;
                      }) || p.outlets?.[0];
                    const availableQty =
                      outlet?.availableQuantity ??
                      outlet?.quantity ??
                      p.availableQuantity ??
                      p.quantity ??
                      0;
                    const isOutOfStock = availableQty <= 0;
                    const guidePrice =
                      outlet?.guidePrice ??
                      outlet?.defaultSalePrice ??
                      outlet?.sellingPrice ??
                      p.guidePrice ??
                      p.defaultSalePrice ??
                      p.sellingPrice ??
                      0;
                    const floorPrice = outlet?.floorPrice ?? p.floorPrice ?? 0;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={p._id}>
                        <Paper
                          elevation={0}
                          sx={appProductTileSx(isOutOfStock)}
                          onClick={() => !isOutOfStock && addToCart(p)}
                        >
                          <Typography variant="subtitle2" noWrap fontWeight={700}>
                            {p.name || p.productId?.name}
                          </Typography>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-end"
                            mt={1.25}
                          >
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Stock: {availableQty}
                              </Typography>
                              {isOutOfStock && (
                                <Label variant="soft" color="error" sx={{ mt: 0.5 }}>
                                  OUT OF STOCK
                                </Label>
                              )}
                            </Box>

                            <Box textAlign="right">
                              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                                Guide: {fCurrency(guidePrice)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Floor: {fCurrency(floorPrice)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Scrollbar>
            <TablePagination
              component="div"
              count={totalProducts}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={[
              {
                p: { xs: 2, sm: 2.5 },
                position: { md: 'sticky' },
                top: { md: 88 },
              },
              appPanelSx,
            ]}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.75 }}>
              Cart
            </Typography>
            <Typography
              variant="h6"
              mb={2}
              sx={{ fontFamily: (t) => t.typography.fontSecondaryFamily, fontWeight: 700 }}
            >
              Current sale
            </Typography>
            <TableContainer sx={{ maxHeight: 380 }}><Table size="small">
              <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell /></TableRow></TableHead>
              <TableBody>{cart.map((i) => {
                const belowFloor = i.floorPrice > 0 && i.unitPrice < i.floorPrice;
                return (
                  <TableRow key={i.productId} sx={{ verticalAlign: 'top' }}>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Typography variant="body2" noWrap>{i.name}</Typography>
                      <Label color={getPricingLabel(i).color} variant="soft">{getPricingLabel(i).label}</Label>
                      {i.pricingWarning && (
                        <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                          {i.pricingWarning}
                        </Typography>
                      )}
                      {belowFloor && canApproveBelowFloor && (
                        <TextField
                          size="small"
                          fullWidth
                          required
                          multiline
                          minRows={1}
                          maxRows={3}
                          label="Below-floor reason"
                          placeholder="Why is this sold below floor? (20–200 chars)"
                          value={i.overrideReason || ''}
                          onChange={(e) => updateOverrideReason(i.productId, e.target.value.slice(0, OVERRIDE_REASON_MAX))}
                          error={
                            !i.overrideReason?.trim() ||
                            (i.overrideReason?.trim().length || 0) < OVERRIDE_REASON_MIN
                          }
                          helperText={
                            !i.overrideReason?.trim()
                              ? 'Required for below-floor sales'
                              : (i.overrideReason?.trim().length || 0) < OVERRIDE_REASON_MIN
                                ? `${OVERRIDE_REASON_MIN - (i.overrideReason?.trim().length || 0)} more characters needed`
                                : `${i.overrideReason.trim().length}/${OVERRIDE_REASON_MAX}`
                          }
                          sx={{ mt: 1, minWidth: 160 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center">
                        <IconButton size="small" onClick={() => updateQuantity(i.productId, i.quantity - 1)}><Iconify icon="solar:minus-circle-bold" /></IconButton>
                        <Typography variant="body2">{i.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(i.productId, i.quantity + 1)}><Iconify icon="solar:plus-circle-bold" /></IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <NumericInput
                        size="small"
                        value={i.unitPrice}
                        onChangeValue={(v) => updateUnitPrice(i.productId, v)}
                        sx={{ width: 100 }}
                        inputProps={
                          isSalesRep && i.floorPrice > 0
                            ? { min: i.floorPrice }
                            : undefined
                        }
                      />
                    </TableCell>
                    <TableCell><IconButton size="small" color="error" onClick={() => removeFromCart(i.productId)}><Iconify icon="solar:trash-bin-trash-bold" /></IconButton></TableCell>
                  </TableRow>
                );
              })}</TableBody>
            </Table></TableContainer>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1} mb={2}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Total</Typography><Typography variant="h6">{fCurrency(total)}</Typography></Stack>
              {change > 0 && <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Change</Typography><Typography variant="body2" color="success.main">{fCurrency(change)}</Typography></Stack>}
            </Stack>
            <Stack spacing={2}>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <MenuItem value="cash">Cash</MenuItem><MenuItem value="card">Card</MenuItem><MenuItem value="transfer">Transfer</MenuItem><MenuItem value="credit">Credit</MenuItem>
              </Select>
              <NumericInput fullWidth label="Amount Paid" value={amountPaid} onChangeValue={(v) => setAmountPaid(v)} />
              <TextField fullWidth label="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <TextField fullWidth label="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={!!resolvedCustomer} />
              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                loading={isSubmitting}
                onClick={handleSubmitSale}
                sx={{ minHeight: 48, borderRadius: '12px' }}
              >
                Complete — {fCurrency(total)}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      <ReceiptPreviewModal
        open={receiptModal.open}
        onClose={() => setReceiptModal({ open: false, saleId: '' })}
        saleId={receiptModal.saleId}
        businessId={appData?.businessId || ''}
      />
    </DashboardContent>
  );
}
