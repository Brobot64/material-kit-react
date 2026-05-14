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

import { fCurrency } from 'src/utils/format-number';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { NumericInput } from 'src/components/numeric-input';

// ----------------------------------------------------------------------

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;      // the negotiated selling price (editable)
  guidePrice: number;     // POS prefill / guide
  floorPrice: number;     // minimum acceptable price
  tax: number;
  discount: number;
  stock: number;
  overrideReason?: string;
  pricingWarning?: string; // shown when below guide but above floor
}

function getPricingLabel(item: CartItem): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
  if (item.unitPrice > item.guidePrice) return { label: 'Above Guide', color: 'success' };
  if (item.unitPrice === item.guidePrice || item.unitPrice === 0) return { label: 'At Guide', color: 'default' };
  if (item.floorPrice > 0 && item.unitPrice < item.floorPrice) return { label: 'Below Floor', color: 'error' };
  return { label: 'Below Guide', color: 'warning' };
}

export function SaleView() {
  const { outlets, appData } = useAuth();
  const isOwner = appData?.role === 'owner';
  const isStoreExec = appData?.role === 'outlet_admin' || appData?.role === 'store_executive';
  const assignedOutletId = appData?.outletId;

  const [selectedOutletId, setSelectedOutletId] = useState<string>(
    isOwner ? (outlets[0]?.id || '') : (assignedOutletId || '')
  );

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(isOwner ? outlets[0].id : (assignedOutletId || outlets[0].id));
    }
  }, [outlets, selectedOutletId, isOwner, assignedOutletId]);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  // resolvedCustomer: found existing customer, null = not found yet
  const [resolvedCustomer, setResolvedCustomer] = useState<any>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.getCustomers({ limit: 100 });
      setCustomers(response.data || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Helpers
  // Customer model: { _id (Customer), userId: { _id (TajUser), fullName, phone, ... } }
  const getCustomerDisplayName = (c: any) =>
    c.userId?.fullName || c.fullName || '';
  const getCustomerPhone = (c: any) =>
    c.userId?.phone || c.phone || '';
  // The sale needs the taj_user._id, not the Customer._id
  const getCustomerTajUserId = (c: any) =>
    c.userId?._id?.toString() || c.userId?.toString() || '';

  // Phone-field live lookup — only activates when the Autocomplete hasn't already set a customer
  useEffect(() => {
    const phone = customerPhone.replace(/\s/g, '');
    if (!phone) {
      // Only clear if nothing was selected via the Autocomplete
      setResolvedCustomer((prev: any) => {
        if (!prev) setCustomerName('');
        return prev;
      });
      return;
    }
    const found = customers.find(
      (c) => getCustomerPhone(c).replace(/\s/g, '') === phone
    );
    if (found) {
      setResolvedCustomer(found);
      setCustomerName(getCustomerDisplayName(found));
    } else {
      setResolvedCustomer(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerPhone, customers]);

  const fetchProducts = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoadingProducts(true);
    try {
      const response = await api.getProductOutlets({
        outletId: selectedOutletId,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      const productsData = response?.results || response?.data || (Array.isArray(response) ? response : []);
      setProducts(productsData);
      setTotalProducts(response?.pagination?.total || productsData.length);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch products', severity: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedOutletId, page, rowsPerPage, searchQuery]);

  useEffect(() => { setPage(0); }, [selectedOutletId, searchQuery]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToCart = (product: any) => {
    const productId = product._id || product.productId?._id;
    const availableStock = product.availableQuantity ?? product.quantity ?? 0;

    if (availableStock <= 0) {
      setSnackbar({ open: true, message: 'Out of stock', severity: 'error' });
      return;
    }

    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        setSnackbar({ open: true, message: 'Insufficient stock', severity: 'error' });
        return;
      }
      setCart(cart.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
      return;
    }

    // Use defaultSalePrice → guidePrice → sellingPrice as the POS prefill (NOT cost)
    const defaultPrice =
      product.defaultSalePrice ??
      product.guidePrice ??
      product.sellingPrice ??
      product.price ??
      0;
    const floor = product.floorPrice ?? 0;
    const guide = product.guidePrice ?? product.sellingPrice ?? defaultPrice;

    setCart([
      ...cart,
      {
        productId,
        name: product.name || product.productId?.name || 'Unknown',
        quantity: 1,
        unitPrice: defaultPrice,
        guidePrice: guide,
        floorPrice: floor,
        tax: 0,
        discount: 0,
        stock: availableStock,
      },
    ]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    const cartItem = cart.find((i) => i.productId === productId);
    if (cartItem && quantity > cartItem.stock) {
      setSnackbar({ open: true, message: 'Cannot exceed available stock', severity: 'error' });
      return;
    }
    setCart(cart.map((item) => item.productId === productId ? { ...item, quantity } : item));
  };

  const updateUnitPrice = (productId: string, unitPrice: number) => {
    setCart(cart.map((item) => {
      if (item.productId !== productId) return item;
      let pricingWarning: string | undefined;
      if (unitPrice < item.floorPrice && item.floorPrice > 0) {
        pricingWarning = `Below floor price (₦${item.floorPrice.toLocaleString()})`;
      } else if (unitPrice < item.guidePrice) {
        pricingWarning = `Below guide price (₦${item.guidePrice.toLocaleString()})`;
      }
      return { ...item, unitPrice, pricingWarning };
    }));
  };

  const updateOverrideReason = (productId: string, overrideReason: string) => {
    setCart(cart.map((item) =>
      item.productId === productId ? { ...item, overrideReason } : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalTax = cart.reduce((sum, item) => sum + item.tax, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal + totalTax - totalDiscount;
  const changeGiven = Math.max(0, amountPaid - total);

  useEffect(() => {
    if (paymentMethod !== 'credit') {
      setAmountPaid(total);
    }
  }, [total, paymentMethod]);

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'Cart is empty', severity: 'error' });
      return;
    }
    const hasCustomer = !!resolvedCustomer || (!!customerPhone && !!customerName);
    if (amountPaid < total && !hasCustomer) {
      setSnackbar({ open: true, message: 'Add customer details for partial/credit sales', severity: 'error' });
      return;
    }

    const belowFloorItems = cart.filter(
      (i) => i.floorPrice > 0 && i.unitPrice < i.floorPrice && !i.overrideReason
    );
    if (belowFloorItems.length > 0 && !isOwner && !isStoreExec) {
      setSnackbar({ open: true, message: 'Items below floor price require an override reason', severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Resolve customer: use existing (taj_user._id) or create new
      let customerId: string | undefined = resolvedCustomer
        ? getCustomerTajUserId(resolvedCustomer)
        : undefined;

      if (!customerId && customerPhone && customerName) {
        // onboardCustomer returns { user: { id, fullName, phone }, customer, account }
        const created = await api.createCustomer({
          fullName: customerName,
          phone: customerPhone,
          notes: customerNotes || undefined,
        });
        customerId = created?.user?.id || created?.data?.user?.id;
        await fetchCustomers();
      }

      await api.createSale({
        businessId: appData?.businessId,
        outletId: selectedOutletId,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax,
          discount: item.discount,
          overrideReason: item.overrideReason,
        })),
        paymentMethod,
        amountPaid,
        customerId,
        notes,
      });
      setSnackbar({ open: true, message: 'Sale recorded successfully', severity: 'success' });
      setCart([]);
      setAmountPaid(0);
      setCustomerPhone('');
      setCustomerName('');
      setCustomerNotes('');
      setResolvedCustomer(null);
      setNotes('');
      fetchProducts();
    } catch (error: any) {
      setSnackbar({ open: true, message: formatError(error), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">New Sale</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Outlet</InputLabel>
          <Select
            value={selectedOutletId}
            label="Outlet"
            onChange={(e) => setSelectedOutletId(e.target.value)}
            disabled={!isOwner}
          >
            {outlets.map((outlet: any) => (
              <MenuItem key={outlet.id} value={outlet.id}>{outlet.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TextField
              fullWidth
              placeholder="Search products by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Scrollbar sx={{ flexGrow: 1, maxHeight: 560 }}>
              <Grid container spacing={2}>
                {loadingProducts ? (
                  <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="text.secondary">Loading products...</Typography>
                  </Grid>
                ) : products.length > 0 ? (
                  products.map((p) => {
                    const availableQty = p.availableQuantity ?? p.quantity ?? 0;
                    const displayPrice = p.defaultSalePrice ?? p.guidePrice ?? p.sellingPrice ?? p.price ?? 0;
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={p._id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            cursor: availableQty > 0 ? 'pointer' : 'not-allowed',
                            opacity: availableQty <= 0 ? 0.5 : 1,
                            '&:hover': { bgcolor: availableQty > 0 ? 'action.hover' : undefined },
                          }}
                          onClick={() => addToCart(p)}
                        >
                          <Typography variant="subtitle2" noWrap fontWeight="bold">
                            {p.name || p.productId?.name || 'Unknown'}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mt={0.5}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {p.sku || p.productId?.sku || p.productId?.barcode || '—'}
                              </Typography>
                              <Typography variant="caption" color={availableQty <= (p.minStock ?? 5) ? 'error' : 'text.secondary'}>
                                Stock: {availableQty} {p.unit || ''}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                                {fCurrency(displayPrice)}
                              </Typography>
                              {p.guidePrice && p.floorPrice && (
                                <Typography variant="caption" color="text.secondary">
                                  Floor: {fCurrency(p.floorPrice)}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          {availableQty <= 0 && (
                            <Label variant="soft" color="error" sx={{ mt: 0.5 }}>OUT OF STOCK</Label>
                          )}
                          {availableQty > 0 && availableQty <= (p.minStock ?? 5) && (
                            <Label variant="soft" color="warning" sx={{ mt: 0.5 }}>LOW STOCK</Label>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })
                ) : (
                  <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="text.secondary">No products found</Typography>
                  </Grid>
                )}
              </Grid>
            </Scrollbar>

            <TablePagination
              component="div"
              count={totalProducts}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </Card>
        </Grid>

        {/* Cart & Checkout */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" mb={2}>Current Sale</Typography>

            <Scrollbar sx={{ flexGrow: 1, maxHeight: 380 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center" width={80}>Qty</TableCell>
                      <TableCell align="right" width={120}>Unit Price</TableCell>
                      <TableCell width={32} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => {
                      const pricingLabel = getPricingLabel(item);
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>{item.name}</Typography>
                            <Label
                              color={pricingLabel.color}
                              variant="soft"
                              sx={{ mt: 0.5, fontSize: 10 }}
                            >
                              {pricingLabel.label}
                            </Label>
                            {item.pricingWarning && (
                              <Box mt={0.5}>
                                <TextField
                                  size="small"
                                  placeholder="Override reason (required)"
                                  value={item.overrideReason || ''}
                                  onChange={(e) => updateOverrideReason(item.productId, e.target.value)}
                                  sx={{ fontSize: 11, '& input': { fontSize: 11, py: 0.5 } }}
                                  fullWidth
                                />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center">
                              <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                                <Iconify icon="solar:minus-circle-bold" width={16} />
                              </IconButton>
                              <Typography variant="body2" sx={{ mx: 0.5, minWidth: 20, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                                <Iconify icon="solar:plus-circle-bold" width={16} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={`Guide: ${fCurrency(item.guidePrice)} | Floor: ${fCurrency(item.floorPrice)}`}>
                              <NumericInput
                                size="small"
                                value={item.unitPrice}
                                onChangeValue={(val) => updateUnitPrice(item.productId, val)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                                }}
                                sx={{ width: 110 }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => removeFromCart(item.productId)}>
                              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {cart.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">Cart is empty — click a product to add</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Stack spacing={0.5} mb={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{fCurrency(subtotal)}</Typography>
              </Stack>
              {totalTax > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Tax</Typography>
                  <Typography variant="body2">{fCurrency(totalTax)}</Typography>
                </Stack>
              )}
              {totalDiscount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" color="error.main">- {fCurrency(totalDiscount)}</Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{fCurrency(total)}</Typography>
              </Stack>
              {changeGiven > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="success.main">Change</Typography>
                  <Typography variant="body2" color="success.main">{fCurrency(changeGiven)}</Typography>
                </Stack>
              )}
            </Stack>

            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="transfer">Bank Transfer</MenuItem>
                  <MenuItem value="credit">Credit / Partial</MenuItem>
                </Select>
              </FormControl>

              <NumericInput
                fullWidth
                size="small"
                label="Amount Paid"
                value={amountPaid}
                onChangeValue={(val) => setAmountPaid(val)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />

              {/* Customer — always visible, required for partial/credit */}
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Customer {amountPaid < total ? '(Required)' : '(Optional)'}
                  </Typography>
                  {resolvedCustomer && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        setResolvedCustomer(null);
                        setCustomerPhone('');
                        setCustomerName('');
                        setCustomerNotes('');
                      }}
                    >
                      Clear
                    </Typography>
                  )}
                </Stack>

                <Stack spacing={1.5}>
                  {/* Primary: phone lookup */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone Number"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      // If user edits phone manually, unpin the autocomplete selection
                      if (resolvedCustomer && getCustomerPhone(resolvedCustomer).replace(/\s/g, '') !== e.target.value.replace(/\s/g, '')) {
                        setResolvedCustomer(null);
                        setCustomerName('');
                      }
                    }}
                    InputProps={{
                      endAdornment: resolvedCustomer ? (
                        <InputAdornment position="end">
                          <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} width={18} />
                        </InputAdornment>
                      ) : null,
                    }}
                    helperText={
                      resolvedCustomer
                        ? `Existing customer found`
                        : customerPhone
                          ? 'No match — fill name below to create'
                          : ''
                    }
                    FormHelperTextProps={{
                      sx: { color: resolvedCustomer ? 'success.main' : 'warning.main' },
                    }}
                  />

                  {/* Secondary: Autocomplete search by name or phone */}
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={customers}
                    value={resolvedCustomer}
                    onChange={(_, selected) => {
                      if (selected) {
                        setResolvedCustomer(selected);
                        setCustomerPhone(getCustomerPhone(selected));
                        setCustomerName(getCustomerDisplayName(selected));
                      } else {
                        setResolvedCustomer(null);
                        setCustomerPhone('');
                        setCustomerName('');
                      }
                    }}
                    getOptionLabel={(option) => {
                      const name = getCustomerDisplayName(option);
                      const phone = getCustomerPhone(option);
                      return phone ? `${name} (${phone})` : name;
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const q = inputValue.toLowerCase();
                      return options.filter((c) => {
                        const name = getCustomerDisplayName(c).toLowerCase();
                        const phone = getCustomerPhone(c).replace(/\s/g, '');
                        return name.includes(q) || phone.includes(q.replace(/\s/g, ''));
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search by name or phone"
                        placeholder="Type to search existing customers…"
                      />
                    )}
                  />

                  {/* Name — auto-filled from lookup, editable only for new customers */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!!resolvedCustomer}
                    placeholder={resolvedCustomer ? '' : 'Enter name for new customer'}
                  />

                  {/* Notes — only for new customers */}
                  {!resolvedCustomer && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Notes (optional)"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Internal notes about this customer"
                    />
                  )}
                </Stack>
              </Box>

              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                loading={isSubmitting}
                onClick={handleSubmitSale}
                disabled={cart.length === 0}
              >
                Complete Sale — {fCurrency(total)}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>

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
