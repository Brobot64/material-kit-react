import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function SaleHistoryView() {
    const { outlets, appData } = useAuth();
    const isOwner = appData?.role === 'owner';
    const assignedOutletId = appData?.outletId;

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOutletId, setSelectedOutletId] = useState(isOwner ? (outlets[0]?.id || '') : (assignedOutletId || ''));

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [selectedSaleDetails, setSelectedSaleDetails] = useState<any>(null);

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

    const fetchSales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getSalesHistory({
                outletId: selectedOutletId || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setSales(response.data || []);
            setTotalElements(response.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch sales history:', error);
            setSnackbar({ open: true, message: 'Failed to fetch sales history', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedOutletId, page, rowsPerPage]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleOpenPaymentModal = (sale: any) => {
        setSelectedSale(sale);
        setPaymentAmount(sale.total - sale.amountPaid);
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
            await api.addSalePayment(selectedSale._id, {
                amount: paymentAmount,
                paymentMethod,
                notes: paymentNotes,
            });
            setSnackbar({ open: true, message: 'Payment recorded successfully', severity: 'success' });
            handleClosePaymentModal();
            fetchSales();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to record payment', severity: 'error' });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handleChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'partially_paid': return 'warning';
            case 'not_paid': return 'error';
            case 'pending': return 'error';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    return (
        <DashboardContent>
            <Breadcrumbs links={[{ name: 'Dashboard', href: '/' }, { name: 'Sales', href: '/sales' }, { name: 'History' }]} sx={{ mb: 5 }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Sales History</Typography>
                <Stack direction="row" spacing={2}>
                    <TextField
                        select
                        size="small"
                        label="Outlet"
                        value={selectedOutletId}
                        onChange={(e) => setSelectedOutletId(e.target.value)}
                        sx={{ minWidth: 150 }}
                        disabled={!isOwner}
                    >
                        {outlets.map((o: any) => (
                            <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        href="/sales"
                    >
                        New Sale
                    </Button>
                </Stack>
            </Stack>

            <Card>
                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Sale ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Paid</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
                                ) : sales.length > 0 ? (
                                    sales.map((sale) => (
                                        <TableRow key={sale._id}>
                                            <TableCell>{fDateTime(sale.createdAt)}</TableCell>
                                            <TableCell>{sale._id.slice(-6).toUpperCase()}</TableCell>
                                            <TableCell>{sale.customerId?.name || 'Walk-in'}</TableCell>
                                            <TableCell>{fCurrency(sale.total)}</TableCell>
                                            <TableCell>{fCurrency(sale.amountPaid)}</TableCell>
                                            <TableCell>{fCurrency(sale.amountPending)}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    let displayStatus = sale.status;
                                                    const balance = sale.total - sale.amountPaid;

                                                    if (balance === 0 || balance < 0) {
                                                        displayStatus = 'completed';
                                                    } else if (sale.amountPaid === 0) {
                                                        displayStatus = 'not_paid';
                                                    } else {
                                                        displayStatus = 'partially_paid';
                                                    }

                                                    return (
                                                        <Label variant="soft" color={getStatusColor(displayStatus)}>
                                                            {displayStatus.replace('_', ' ').toUpperCase()}
                                                        </Label>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    {sale.total - sale.amountPaid > 0 && (
                                                        <Button size="small" variant="outlined" onClick={() => handleOpenPaymentModal(sale)}>
                                                            Pay
                                                        </Button>
                                                    )}
                                                    <IconButton size="small" aria-label="view details" onClick={() => handleOpenDetailsModal(sale)}>
                                                        <Iconify icon="solar:eye-bold" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body1" color="text.secondary">No sales found</Typography>
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
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Payment modal */}
            <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} fullWidth maxWidth="xs">
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Recording payment for Sale #{selectedSale?._id.slice(-6).toUpperCase()}
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            label="Amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
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

            <Dialog open={openDetailsModal} onClose={handleCloseDetailsModal} fullWidth maxWidth="md">
                <DialogTitle>Sale Details #{selectedSaleDetails?._id.slice(-6).toUpperCase()}</DialogTitle>
                <DialogContent dividers>
                    {selectedSaleDetails && (
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Sale ID:</Typography>
                                <Typography variant="body2">{selectedSaleDetails._id}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Date:</Typography>
                                <Typography variant="body2">{fDateTime(selectedSaleDetails.createdAt)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Customer:</Typography>
                                <Typography variant="body2">{selectedSaleDetails.customerId?.name || 'Walk-in'}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Subtotal:</Typography>
                                <Typography variant="body2">{fCurrency(selectedSaleDetails.subtotal)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Discount:</Typography>
                                <Typography variant="body2">{fCurrency(selectedSaleDetails.discountTotal)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Tax:</Typography>
                                <Typography variant="body2">{fCurrency(selectedSaleDetails.taxTotal)}</Typography>
                            </Stack>
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
                                <Typography variant="body2">{fCurrency(selectedSaleDetails.total - selectedSaleDetails.amountPaid)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Payment Method:</Typography>
                                <Typography variant="body2">{selectedSaleDetails.paymentMethod}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2">Status:</Typography>
                                <Label
                                    variant="soft"
                                    color={getStatusColor(
                                        selectedSaleDetails.total - selectedSaleDetails.amountPaid === 0
                                            ? 'completed'
                                            : selectedSaleDetails.amountPaid === 0
                                                ? 'not_paid'
                                                : 'partially_paid'
                                    )}
                                >
                                    {(selectedSaleDetails.total - selectedSaleDetails.amountPaid === 0
                                        ? 'completed'
                                        : selectedSaleDetails.amountPaid === 0
                                            ? 'not_paid'
                                            : 'partially_paid'
                                    ).replace('_', ' ').toUpperCase()}
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
                    {selectedSaleDetails && selectedSaleDetails.total - selectedSaleDetails.amountPaid > 0 && (
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
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
