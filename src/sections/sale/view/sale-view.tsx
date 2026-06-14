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
import Tooltip from '@mui/material/Tooltip';
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
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { NumericInput } from 'src/components/numeric-input';

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

export function SaleView() {
  const { outlets, appData } = useAuth();
  const isOwner = appData?.role === 'owner';
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
    open: false, message: '', severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.getCustomers({ limit: 100 });
      setCustomers(response.data || []);
    } catch { /* ignore */ }
  }, []);

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
      setSnackbar({ open: true, message: 'Failed to fetch products', severity: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedOutletId, page, rowsPerPage, debouncedSearch]);

  useEffect(() => { setPage(0); }, [selectedOutletId, debouncedSearch]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToCart = (product: any) => {
    const productId = product._id || product.productId?._id;
    const stock = product.availableQuantity ?? product.quantity ?? 0;
    if (stock <= 0) return;
    
    const existing = cart.find((i) => i.productId === productId);
    if (existing) {
      if (existing.quantity >= stock) {
        setSnackbar({ open: true, message: 'Insufficient stock', severity: 'error' });
        return;
      }
      setCart(cart.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));       
    } else {
      const price = product.defaultSalePrice ?? product.guidePrice ?? product.sellingPrice ?? 0;
      setCart([...cart, {
        productId,
        name: product.name || product.productId?.name || 'Unknown',
        quantity: 1,
        unitPrice: price,
        guidePrice: product.guidePrice ?? price,
        floorPrice: product.floorPrice ?? 0,
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
      let warn: string | undefined;
      if (up < i.floorPrice && i.floorPrice > 0) warn = `Below floor (\u20A6${i.floorPrice})`;
      else if (up < i.guidePrice) warn = `Below guide (\u20A6${i.guidePrice})`;
      return { ...i, unitPrice: up, pricingWarning: warn };
    }));
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
    setIsSubmitting(true);
    try {
      let cid = resolvedCustomer?.userId?._id || resolvedCustomer?.userId;
      if (!cid && customerPhone && customerName) {
        const created = await api.createCustomer({ fullName: customerName, phone: customerPhone });       
        cid = created?.user?.id || created?.data?.user?.id;
      }
      await api.createSale({
        businessId: appData?.businessId,
        outletId: selectedOutletId,
        items: cart.map(i => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
          tax: i.tax, discount: i.discount, overrideReason: i.overrideReason
        })),
        paymentMethod, amountPaid, customerId: cid, notes,
      });
      setSnackbar({ open: true, message: 'Sale recorded', severity: 'success' });
      setCart([]); setAmountPaid(0); setCustomerPhone(''); setCustomerName(''); setResolvedCustomer(null);
      fetchProducts();
    } catch (e: any) {
      setSnackbar({ open: true, message: formatError(e), severity: 'error' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">New Sale</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Outlet</InputLabel>
          <Select value={selectedOutletId} label="Outlet" onChange={(e) => setSelectedOutletId(e.target.value)} disabled={!isOwner}>
            {outlets.map((o: any) => <MenuItem key={o.id || o._id} value={o.id || o._id}>{o.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <TextField fullWidth placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Iconify icon="eva:search-fill" /></InputAdornment>) }} sx={{ mb: 2 }} />
            <Scrollbar sx={{ maxHeight: 560 }}>
              <Grid container spacing={2}>
                {loadingProducts ? <CircularProgress sx={{ mx: 'auto', my: 5 }} /> : products.map((p) => {
                  const availableQty = p.availableQuantity ?? p.quantity ?? 0;
                  const isOutOfStock = availableQty <= 0;
                  
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={p._id}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          opacity: isOutOfStock ? 0.5 : 1,
                          '&:hover': { bgcolor: isOutOfStock ? 'transparent' : 'action.hover' }
                        }} 
                        onClick={() => !isOutOfStock && addToCart(p)}
                      >
                        <Typography variant="subtitle2" noWrap fontWeight="bold">
                          {p.name || p.productId?.name}
                        </Typography>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mt={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Stock: {availableQty}
                            </Typography>
                            {isOutOfStock && <Label variant="soft" color="error" sx={{ mt: 0.5 }}>OUT OF STOCK</Label>}
                          </Box>
                          
                          <Box textAlign="right">
                            <Typography variant="subtitle2" color="primary.main">
                              Guide: {fCurrency(p.guidePrice ?? p.defaultSalePrice)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Floor: {fCurrency(p.floorPrice ?? 0)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Scrollbar>
            <TablePagination component="div" count={totalProducts} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))} /> 
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Current Sale</Typography>
            <TableContainer sx={{ maxHeight: 380 }}><Table size="small">
              <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell /></TableRow></TableHead>
              <TableBody>{cart.map((i) => (
                <TableRow key={i.productId}>
                  <TableCell><Typography variant="body2" noWrap>{i.name}</Typography><Label color={getPricingLabel(i).color} variant="soft">{getPricingLabel(i).label}</Label></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center">
                      <IconButton size="small" onClick={() => updateQuantity(i.productId, i.quantity - 1)}><Iconify icon="solar:minus-circle-bold" /></IconButton>
                      <Typography variant="body2">{i.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(i.productId, i.quantity + 1)}><Iconify icon="solar:plus-circle-bold" /></IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align="right"><NumericInput size="small" value={i.unitPrice} onChangeValue={(v) => updateUnitPrice(i.productId, v)} sx={{ width: 100 }} /></TableCell>
                  <TableCell><IconButton size="small" color="error" onClick={() => removeFromCart(i.productId)}><Iconify icon="solar:trash-bin-trash-bold" /></IconButton></TableCell>
                </TableRow>
              ))}</TableBody>
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
              <LoadingButton fullWidth size="large" variant="contained" loading={isSubmitting} onClick={handleSubmitSale}>Complete - {fCurrency(total)}</LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardContent>
  );
}
