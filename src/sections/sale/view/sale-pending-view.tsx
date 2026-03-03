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
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function SalePendingView() {
    const { outlets } = useAuth();

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOutletId, setSelectedOutletId] = useState(outlets[0]?._id || '');

    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const fetchPendingSales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getPendingSales({ outletId: selectedOutletId });
            setSales(response || []);
        } catch (error) {
            console.error('Failed to fetch pending sales:', error);
            setSnackbar({ open: true, message: 'Failed to fetch pending sales', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedOutletId]);

    useEffect(() => {
        fetchPendingSales();
    }, [fetchPendingSales]);

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
            fetchPendingSales();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to record payment', severity: 'error' });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    return (
        <DashboardContent>
            <Breadcrumbs links={[{ name: 'Dashboard', href: '/' }, { name: 'Sales', href: '/sales' }, { name: 'Pending Payments' }]} sx={{ mb: 5 }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Pending Payments</Typography>
                <TextField
                    select
                    size="small"
                    label="Outlet"
                    value={selectedOutletId}
                    onChange={(e) => setSelectedOutletId(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    {outlets.map((o: any) => (
                        <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>
                    ))}
                </TextField>
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
                                    <TableCell>Deadline</TableCell>
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
                                            <TableCell>{sale.customerId?.name || 'Unknown'}</TableCell>
                                            <TableCell>{fCurrency(sale.total)}</TableCell>
                                            <TableCell>{fCurrency(sale.amountPaid)}</TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle2" color="error">
                                                    {fCurrency(sale.total - sale.amountPaid)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{sale.paymentDeadline ? fDateTime(sale.paymentDeadline) : 'N/A'}</TableCell>
                                            <TableCell align="right">
                                                <Button size="small" variant="contained" onClick={() => handleOpenPaymentModal(sale)}>
                                                    Record Payment
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body1" color="text.secondary">No pending payments found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Card>

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
