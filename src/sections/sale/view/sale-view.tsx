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
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { NumericInput } from 'src/components/numeric-input';

// ----------------------------------------------------------------------

interface CartItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    tax: number;
    discount: number;
    stock: number;
}

export function SaleView() {
    const { outlets, appData } = useAuth();
    const isOwner = appData?.role === 'owner';
    const assignedOutletId = appData?.outletId;

    const [selectedOutletId, setSelectedOutletId] = useState<string>(isOwner ? (outlets[0]?.id || '') : (assignedOutletId || ''));

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
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
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
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const fetchProducts = useCallback(async () => {
        if (!selectedOutletId) return;
        setLoadingProducts(true);
        try {
            const response = await api.getProductOutlets({
                outletId: selectedOutletId,
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery
            });
            // Handle 'results' or 'data' or raw array
            const productsData = response?.results || response?.data || (Array.isArray(response) ? response : []);
            setProducts(productsData);
            setTotalProducts(response?.pagination?.total || productsData.length);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setSnackbar({ open: true, message: 'Failed to fetch products', severity: 'error' });
        } finally {
            setLoadingProducts(false);
        }
    }, [selectedOutletId, page, rowsPerPage, searchQuery]);

    useEffect(() => {
        setPage(0); // Reset page on outlet or search change
    }, [selectedOutletId, searchQuery]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addToCart = (product: any) => {
        const productId = product._id || product.productId?._id;
        const existingItem = cart.find((item) => item.productId === productId);
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                setSnackbar({ open: true, message: 'Insufficient stock', severity: 'error' });
                return;
            }
            setCart(
                cart.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            if (product.quantity <= 0) {
                setSnackbar({ open: true, message: 'Out of stock', severity: 'error' });
                return;
            }
            setCart([
                ...cart,
                {
                    productId: product._id,
                    name: product.name,
                    quantity: 1,
                    // price: product.price || product.sellingPrice,
                    price: product.cost || product.productId?.costPrice || '',
                    tax: 0, // Default tax or from product
                    discount: 0,
                    stock: product.quantity,
                },
            ]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const cartItem = cart.find((i) => i.productId === productId);
        if (cartItem && quantity > cartItem.stock) {
            setSnackbar({ open: true, message: 'Cannot exceed available stock', severity: 'error' });
            return;
        }
        setCart(cart.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalTax = cart.reduce((sum, item) => sum + item.tax, 0);
    const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal + totalTax - totalDiscount;

    // Auto-set amountPaid if cash and not partial
    useEffect(() => {
        if (paymentMethod !== 'credit' && amountPaid === 0) {
            setAmountPaid(total);
        }
    }, [total, paymentMethod, amountPaid]);

    const handleSubmitSale = async () => {
        if (cart.length === 0) {
            setSnackbar({ open: true, message: 'Cart is empty', severity: 'error' });
            return;
        }
        if (amountPaid < total && !selectedCustomer) {
            setSnackbar({ open: true, message: 'Customer selection required for partial/credit sales', severity: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createSale({
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    tax: item.tax,
                    discount: item.discount,
                })),
                paymentMethod,
                amountPaid,
                customerId: selectedCustomer?._id || undefined,
                notes,
                outletId: selectedOutletId || "",
            });
            setSnackbar({ open: true, message: 'Sale processed successfully', severity: 'success' });
            setCart([]);
            setAmountPaid(0);
            setSelectedCustomer(null);
            setNotes('');
            fetchProducts(); // Refresh stock
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to process sale', severity: 'error' });
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
                            <MenuItem key={outlet.id} value={outlet.id}>
                                {outlet.name}
                            </MenuItem>
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

                        <Scrollbar sx={{ flexGrow: 1, maxHeight: 600 }}>
                            <Grid container spacing={2}>
                                {loadingProducts ? (
                                    <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', py: 5 }}>
                                        <Typography color="text.secondary">Loading products...</Typography>
                                    </Grid>
                                ) : products.length > 0 ? (
                                    products.map((p) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={p._id}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    position: 'relative'
                                                }}
                                                onClick={() => addToCart(p)}
                                            >
                                                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }} noWrap>
                                                    {p.name || p.productId?.name || 'Unknown Product'}
                                                </Typography>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            SKU: {p.sku || p.productId?.barcode || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Stock: {p.quantity} {p.unit || p.productId?.unit || ''}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700 }}>
                                                            {fCurrency(p.price || p.sellingPrice)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Cost: {fCurrency(p.cost || p.productId?.costPrice || '')}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                {p.quantity <= 0 && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, width: '100%', height: '100%',
                                                        bgcolor: 'rgba(255,255,255,0.7)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="h6" color="error">OUT OF STOCK</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Grid>
                                    ))
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
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 20, 50]}
                        />
                    </Card>
                </Grid>

                {/* Cart & Checkout */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" mb={2}>Current Sale</Typography>

                        <TableContainer sx={{ flexGrow: 1, minHeight: 300, overflow: 'unset' }}>
                            <Scrollbar>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="center">Qty</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right" />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cart.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell sx={{ maxWidth: 150 }}>
                                                    <Typography variant="body2" noWrap>{item.name}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" alignItems="center" justifyContent="center">
                                                        <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                                                            <Iconify icon="solar:minus-circle-bold" />
                                                        </IconButton>
                                                        <Typography variant="body2" sx={{ mx: 1 }}>{item.quantity}</Typography>
                                                        <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                                                            <Iconify icon="solar:plus-circle-bold" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">{fCurrency(item.price * item.quantity)}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="error" onClick={() => removeFromCart(item.productId)}>
                                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {cart.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    <Typography variant="body2" color="text.secondary">Cart is empty</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                        <Stack spacing={1} mb={3}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                <Typography variant="body2">{fCurrency(subtotal)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Tax</Typography>
                                <Typography variant="body2">{fCurrency(totalTax)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Discount</Typography>
                                <Typography variant="body2">- {fCurrency(totalDiscount)}</Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6">{fCurrency(total)}</Typography>
                            </Stack>
                        </Stack>

                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={paymentMethod}
                                    label="Payment Method"
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="card">Card</MenuItem>
                                    <MenuItem value="transfer">Transfer</MenuItem>
                                    <MenuItem value="credit">Credit / Partial</MenuItem>
                                </Select>
                            </FormControl>

                            <NumericInput
                                fullWidth
                                label="Amount Paid"
                                value={amountPaid}
                                onChangeValue={(val) => setAmountPaid(val)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />

                            {(paymentMethod === 'credit' || amountPaid < total) && (
                                <Autocomplete
                                    fullWidth
                                    options={customers}
                                    getOptionLabel={(option) => {
                                        const name = option.fullName || option.userId?.fullName || 'Unknown';
                                        const phone = option.phone || option.userId?.phone || 'No Phone';
                                        return `${name} (${phone})`;
                                    }}
                                    value={selectedCustomer}
                                    onChange={(event, newValue) => setSelectedCustomer(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Customer"
                                            helperText="Required for tracking debt"
                                        />
                                    )}
                                />
                            )}

                            <TextField
                                fullWidth
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
                                color="primary"
                                loading={isSubmitting}
                                onClick={handleSubmitSale}
                                disabled={cart.length === 0}
                            >
                                Complete Sale
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
