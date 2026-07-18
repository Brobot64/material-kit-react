import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { appPanelSx, appFilterBarSx } from 'src/theme/app-surface';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PageHeader } from 'src/components/page-header';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { ReceiptPreviewModal } from 'src/components/receipt-preview/ReceiptPreviewModal';

// ----------------------------------------------------------------------

export function SaleHistoryView() {
    const { outlets, appData } = useAuth();
    const isOwner = appData?.role === 'owner';
    const assignedOutletId = appData?.outletId;
    const businessId = appData?.businessId;

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOutletId, setSelectedOutletId] = useState(isOwner ? (outlets[0]?.id || '') : (assignedOutletId || ''));

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // Server-side filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Client-side filters
    const [keyword, setKeyword] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [selectedSaleDetails, setSelectedSaleDetails] = useState<any>(null);

    const [receiptModal, setReceiptModal] = useState({ open: false, saleId: '' });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    useEffect(() => {
        if (outlets.length > 0 && !selectedOutletId) {
            setSelectedOutletId(isOwner ? outlets[0].id : (assignedOutletId || outlets[0].id));
        }
    }, [outlets, selectedOutletId, isOwner, assignedOutletId]);

    // Reset to page 0 when server-side filters change
    useEffect(() => { setPage(0); }, [selectedOutletId, startDate, endDate, statusFilter]);

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getSalesHistory({
                outletId: selectedOutletId || undefined,
                page: page + 1,
                limit: rowsPerPage,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                status: statusFilter || undefined,
            });
            setSales(response.data || []);
            setTotalElements(response.pagination?.total || 0);
        } catch {
            setSnackbar({ open: true, message: 'Failed to fetch sales history', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedOutletId, page, rowsPerPage, startDate, endDate, statusFilter]);

    useEffect(() => { fetchSales(); }, [fetchSales]);

    // Client-side keyword + price filter applied on top of server results
    const filteredSales = useMemo(() => {
        let result = sales;
        if (keyword) {
            const q = keyword.toLowerCase();
            result = result.filter((s) => {
                const customer = s.customerName || s.customerId?.fullName || s.customerId?.name || '';
                const saleId = s._id?.toLowerCase() || '';
                const saleNum = (s.saleNumber || '').toLowerCase();
                const cashier = (s.cashierName || '').toLowerCase();
                return (
                    customer.toLowerCase().includes(q) ||
                    saleId.includes(q) ||
                    saleNum.includes(q) ||
                    cashier.includes(q)
                );
            });
        }
        if (minAmount) result = result.filter((s) => s.total >= Number(minAmount));
        if (maxAmount) result = result.filter((s) => s.total <= Number(maxAmount));
        return result;
    }, [sales, keyword, minAmount, maxAmount]);

    const handleCopySaleId = (id: string) => {
        navigator.clipboard.writeText(id).then(() => {
            setSnackbar({ open: true, message: 'Sale ID copied to clipboard', severity: 'success' });
        });
    };

    const handleOpenPaymentModal = (sale: any) => {
        setSelectedSale(sale);
        setPaymentAmount(sale.amountPending ?? (sale.total - sale.amountPaid));
        setOpenPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setOpenPaymentModal(false);
        setSelectedSale(null);
        setPaymentAmount(0);
        setPaymentNotes('');
    };

    const handleOpenDetailsModal = (sale: any) => {
        setSelectedSaleDetails(sale);
        setOpenDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setOpenDetailsModal(false);
        setSelectedSaleDetails(null);
    };

    const handleSubmitPayment = async () => {
        if (!selectedSale || paymentAmount <= 0) return;
        setIsSubmittingPayment(true);
        try {
            await api.addSalePayment(selectedSale._id, { amount: paymentAmount, paymentMethod, notes: paymentNotes });
            setSnackbar({ open: true, message: 'Payment recorded successfully', severity: 'success' });
            handleClosePaymentModal();
            fetchSales();
        } catch (error: any) {
            setSnackbar({ open: true, message: formatError(error), severity: 'error' });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'partially_paid': return 'warning';
            case 'not_paid':
            case 'pending':
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const resolveDisplayStatus = (sale: any) => {
        const balance = sale.total - sale.amountPaid;
        if (balance <= 0) return 'completed';
        if (sale.amountPaid === 0) return 'not_paid';
        return 'partially_paid';
    };

    const activeFilterCount = [startDate, endDate, statusFilter, minAmount, maxAmount].filter(Boolean).length;

    return (
        <DashboardContent>
            <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Sales', href: '/app/sales' }, { name: 'History' }]} sx={{ mb: 2 }} />

            <PageHeader
                kicker="Sales"
                title="Sales History"
                subtitle="Browse past sales, record payments, and view receipts."
                action={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: 1, sm: 'auto' } }}>
                        <TextField
                            select
                            size="small"
                            label="Outlet"
                            value={selectedOutletId}
                            onChange={(e) => setSelectedOutletId(e.target.value)}
                            sx={{ minWidth: { xs: 1, sm: 150 } }}
                            disabled={!isOwner}
                        >
                            {outlets.map((o: any) => (
                                <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                            ))}
                        </TextField>
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            href="/app/sales"
                            fullWidth
                            sx={{ width: { xs: 1, sm: 'auto' } }}
                        >
                            New Sale
                        </Button>
                    </Stack>
                }
            />

            {/* Search + Filter bar */}
            <Card sx={appPanelSx}>
                <Box sx={appFilterBarSx}>
                    <TextField
                        size="small"
                        placeholder="Search by customer, cashier, sale ID…"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            endAdornment: keyword ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setKeyword('')}>
                                        <Iconify icon="eva:close-fill" width={16} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Button
                            size="small"
                            variant={showFilters ? 'contained' : 'outlined'}
                            startIcon={<Iconify icon="ic:round-filter-list" />}
                            onClick={() => setShowFilters((v) => !v)}
                            endIcon={
                                activeFilterCount > 0 ? (
                                    <Chip label={activeFilterCount} size="small" color="error" sx={{ height: 18, fontSize: 11 }} />
                                ) : null
                            }
                        >
                            Filters
                        </Button>
                        {activeFilterCount > 0 && (
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setStatusFilter('');
                                    setMinAmount('');
                                    setMaxAmount('');
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Collapse in={showFilters}>
                    <Box sx={{ ...appFilterBarSx, pt: 0, borderTop: 1, borderStyle: 'dashed', borderColor: 'divider' }}>
                        <TextField
                            size="small"
                            label="From date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            size="small"
                            label="To date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="">All statuses</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="partially_paid">Partially Paid</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="overdue">Overdue</MenuItem>
                        </TextField>
                        <TextField
                            size="small"
                            label="Min amount (₦)"
                            type="number"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            sx={{ minWidth: 140 }}
                        />
                        <TextField
                            size="small"
                            label="Max amount (₦)"
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            sx={{ minWidth: 140 }}
                        />
                    </Box>
                </Collapse>

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                        <Table sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Sale ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Cashier</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Paid</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 9 }).map((__, j) => (
                                                <TableCell key={j}><Skeleton animation="wave" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredSales.length > 0 ? (
                                    filteredSales.map((sale) => (
                                        <TableRow key={sale._id}>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(sale.createdAt)}</TableCell>

                                            {/* Clickable Sale ID — copies full _id to clipboard */}
                                            <TableCell>
                                                <Tooltip title="Click to copy full Sale ID" placement="top">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            cursor: 'pointer',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            '&:hover': { color: 'primary.main' },
                                                        }}
                                                        onClick={() => handleCopySaleId(sale._id)}
                                                    >
                                                        {sale.saleNumber || sale._id.slice(-6).toUpperCase()}
                                                        <Iconify icon="solar:copy-bold" width={14} sx={{ opacity: 0.5 }} />
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                {sale.customerName
                                                    || sale.customerId?.fullName
                                                    || sale.customerId?.name
                                                    || 'Walk-in'}
                                            </TableCell>

                                            <TableCell>{sale.cashierName || '—'}</TableCell>

                                            <TableCell>{fCurrency(sale.total)}</TableCell>
                                            <TableCell>{fCurrency(sale.amountPaid)}</TableCell>
                                            <TableCell>{fCurrency(sale.amountPending ?? Math.max(0, sale.total - sale.amountPaid))}</TableCell>

                                            <TableCell>
                                                <Label variant="soft" color={getStatusColor(resolveDisplayStatus(sale))}>
                                                    {resolveDisplayStatus(sale).replace('_', ' ').toUpperCase()}
                                                </Label>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    {(sale.amountPending ?? (sale.total - sale.amountPaid)) > 0 && (
                                                        <Button size="small" variant="outlined" onClick={() => handleOpenPaymentModal(sale)}>
                                                            Pay
                                                        </Button>
                                                    )}
                                                    <Tooltip title="View details">
                                                        <IconButton size="small" onClick={() => handleOpenDetailsModal(sale)}>
                                                            <Iconify icon="solar:eye-bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Preview receipt">
                                                        <IconButton size="small" onClick={() => setReceiptModal({ open: true, saleId: sale._id })}>
                                                            <Iconify icon="solar:receipt-bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {keyword || activeFilterCount > 0 ? 'No sales match your filters' : 'No sales found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Card>

            <TablePagination
                page={page}
                component="div"
                count={totalElements}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            {/* Payment modal */}
            <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} fullWidth maxWidth="xs">
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Sale #{selectedSale?.saleNumber || selectedSale?._id.slice(-6).toUpperCase()}
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            label="Amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="transfer">Transfer</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Notes"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePaymentModal} color="inherit">Cancel</Button>
                    <LoadingButton
                        variant="contained"
                        loading={isSubmittingPayment}
                        onClick={handleSubmitPayment}
                        disabled={paymentAmount <= 0}
                    >
                        Record Payment
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Details modal */}
            <Dialog open={openDetailsModal} onClose={handleCloseDetailsModal} fullWidth maxWidth="md">
                <DialogTitle>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <span>Sale #{selectedSaleDetails?.saleNumber || selectedSaleDetails?._id.slice(-6).toUpperCase()}</span>
                        {selectedSaleDetails && (
                            <Tooltip title="Copy full Sale ID">
                                <Chip
                                    label={selectedSaleDetails._id}
                                    size="small"
                                    icon={<Iconify icon="solar:copy-bold" width={14} />}
                                    onClick={() => handleCopySaleId(selectedSaleDetails._id)}
                                    sx={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', maxWidth: 240 }}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedSaleDetails && (
                        <Stack spacing={2}>
                            {[
                                { label: 'Date', value: fDateTime(selectedSaleDetails.createdAt) },
                                {
                                    label: 'Customer',
                                    value: selectedSaleDetails.customerName
                                        || selectedSaleDetails.customerId?.fullName
                                        || selectedSaleDetails.customerId?.name
                                        || 'Walk-in'
                                },
                                { label: 'Cashier', value: selectedSaleDetails.cashierName || '—' },
                                { label: 'Payment Method', value: selectedSaleDetails.paymentMethod },
                                { label: 'Subtotal', value: fCurrency(selectedSaleDetails.subtotal) },
                                { label: 'Discount', value: fCurrency(selectedSaleDetails.discountTotal) },
                                { label: 'Tax', value: fCurrency(selectedSaleDetails.taxTotal) },
                            ].map(({ label, value }) => (
                                <Stack key={label} direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{label}:</Typography>
                                    <Typography variant="body2">{value}</Typography>
                                </Stack>
                            ))}
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">{fCurrency(selectedSaleDetails.total)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Amount Paid:</Typography>
                                <Typography variant="body2">{fCurrency(selectedSaleDetails.amountPaid)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Balance:</Typography>
                                <Typography variant="body2">
                                    {fCurrency(selectedSaleDetails.amountPending ?? Math.max(0, selectedSaleDetails.total - selectedSaleDetails.amountPaid))}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Status:</Typography>
                                <Label variant="soft" color={getStatusColor(resolveDisplayStatus(selectedSaleDetails))}>
                                    {resolveDisplayStatus(selectedSaleDetails).replace('_', ' ').toUpperCase()}
                                </Label>
                            </Stack>
                            {selectedSaleDetails.notes && (
                                <Stack>
                                    <Typography variant="subtitle2">Notes:</Typography>
                                    <Typography variant="body2">{selectedSaleDetails.notes}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsModal} color="inherit">Close</Button>
                    {selectedSaleDetails && (
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="solar:receipt-bold" />}
                            onClick={() => {
                                handleCloseDetailsModal();
                                setReceiptModal({ open: true, saleId: selectedSaleDetails._id });
                            }}
                        >
                            View Receipt
                        </Button>
                    )}
                    {selectedSaleDetails && (selectedSaleDetails.amountPending ?? (selectedSaleDetails.total - selectedSaleDetails.amountPaid)) > 0 && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleCloseDetailsModal();
                                handleOpenPaymentModal(selectedSaleDetails);
                            }}
                        >
                            Complete Payment
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ReceiptPreviewModal
                open={receiptModal.open}
                onClose={() => setReceiptModal({ open: false, saleId: '' })}
                saleId={receiptModal.saleId}
                businessId={businessId || ''}
            />
        </DashboardContent>
    );
}
