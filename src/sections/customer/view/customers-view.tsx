import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function CustomersView() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [pagination, setPagination] = useState({
        page: 0,
        limit: 10,
        total: 0,
    });

    const [openModal, setOpenModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const [customerData, setCustomerData] = useState({
        fullName: '',
        phone: '',
        email: '',
        notes: '',
        tags: [] as string[],
        isActive: true,
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getCustomers({
                page: pagination.page + 1,
                limit: pagination.limit
            });
            setCustomers(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination?.total || response.data.length
            }));
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setSnackbar({ open: true, message: 'Failed to fetch customers', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleOpenModal = async (customer?: any) => {
        if (customer) {
            setEditMode(true);
            setSelectedCustomer(customer);
            setLoadingDetails(true);
            setOpenModal(true); // Open early with loading state
            try {
                // Fetch full details to get notes, tags etc.
                const details = await api.getCustomer(customer._id);
                setCustomerData({
                    fullName: details.userId.fullName,
                    phone: details.userId.phone,
                    email: details.userId.email || '',
                    notes: details.notes || '',
                    tags: details.tags || [],
                    isActive: details.isActive !== false,
                });
            } catch (error) {
                console.error('Failed to fetch customer details:', error);
                // Fallback to list data
                setCustomerData({
                    fullName: customer.userId.fullName,
                    phone: customer.userId.phone,
                    email: customer.userId.email || '',
                    notes: customer.notes || '',
                    tags: customer.tags || [],
                    isActive: customer.isActive !== false,
                });
            } finally {
                setLoadingDetails(false);
            }
        } else {
            setEditMode(false);
            setSelectedCustomer(null);
            setCustomerData({
                fullName: '',
                phone: '',
                email: '',
                notes: '',
                tags: [],
                isActive: true,
            });
            setOpenModal(true);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setLoadingDetails(false);
    };

    const handleSaveCustomer = async () => {
        setIsSubmitting(true);
        try {
            if (editMode && selectedCustomer) {
                await api.updateCustomer(selectedCustomer._id, {
                    notes: customerData.notes,
                    tags: customerData.tags,
                    isActive: customerData.isActive,
                });
                setSnackbar({ open: true, message: 'Customer updated successfully', severity: 'success' });
            } else {
                await api.createCustomer({
                    fullName: customerData.fullName,
                    phone: customerData.phone,
                    email: customerData.email || undefined,
                    notes: customerData.notes || undefined,
                    tags: customerData.tags,
                });
                setSnackbar({ open: true, message: 'Customer created successfully', severity: 'success' });
            }
            fetchCustomers();
            handleCloseModal();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to save customer', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
        try {
            await api.deactivateCustomer(id);
            setSnackbar({ open: true, message: 'Customer deactivated', severity: 'success' });
            fetchCustomers();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to deactivate customer', severity: 'error' });
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPagination(prev => ({
            ...prev,
            limit: parseInt(event.target.value, 10),
            page: 0
        }));
    };

    const filteredCustomers = customers.filter(
        (c) =>
            c.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.userId.phone.includes(searchQuery)
    );

    return (
        <DashboardContent>
            <Breadcrumbs links={[{ name: 'Dashboard', href: '/' }, { name: 'Customers' }]} sx={{ mb: 5 }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Customers</Typography>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenModal()}
                >
                    New Customer
                </Button>
            </Stack>

            <Card>
                <Box sx={{ p: 2.5 }}>
                    <TextField
                        fullWidth
                        placeholder="Search customers by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Total Spent</TableCell>
                                    <TableCell>Tags</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body2" color="text.secondary">Loading customers...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer._id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2">{customer.userId.fullName}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack>
                                                    <Typography variant="body2">{customer.userId.phone}</Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        {customer.userId.email || 'No email'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{fCurrency(customer.totalSpent || 0)}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                    {customer.tags?.map((tag: string) => (
                                                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Label variant="soft" color={customer.isActive ? 'success' : 'default'}>
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </Label>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="Edit">
                                                        <IconButton onClick={() => handleOpenModal(customer)}>
                                                            <Iconify icon="solar:pen-bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Deactivate">
                                                        <IconButton color="error" onClick={() => handleDeleteCustomer(customer._id)}>
                                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No customers found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.page}
                    onPageChange={handleChangePage}
                    rowsPerPage={pagination.limit}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>

            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>
                    {loadingDetails ? 'Loading Details...' : (editMode ? 'Edit Customer' : 'Add New Customer')}
                </DialogTitle>
                <DialogContent dividers sx={{ position: 'relative', minHeight: 200 }}>
                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                            <Typography variant="body2" color="text.secondary">Fetching latest customer data...</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={3} sx={{ py: 1 }}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={customerData.fullName}
                                onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                                disabled={editMode}
                                placeholder="Enter full name"
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={customerData.phone}
                                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                disabled={editMode}
                                placeholder="e.g. 08012345678"
                            />
                            <TextField
                                fullWidth
                                label="Email Address (Optional)"
                                value={customerData.email}
                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                disabled={editMode}
                                placeholder="customer@example.com"
                            />
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={customerData.tags}
                                onChange={(e, newValue) => setCustomerData({ ...customerData, tags: newValue as string[] })}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip label={option} {...getTagProps({ index })} size="small" variant="outlined" color="info" />
                                    ))
                                }
                                renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tag..." />}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Internal Notes"
                                value={customerData.notes}
                                onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                                placeholder="Add any relevant information about this customer"
                            />
                            {editMode && (
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2">Account Status:</Typography>
                                    <Label
                                        variant="soft"
                                        color={customerData.isActive ? 'success' : 'default'}
                                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => setCustomerData({ ...customerData, isActive: !customerData.isActive })}
                                    >
                                        {customerData.isActive ? 'Active' : 'Inactive'} (Click to toggle)
                                    </Label>
                                </Stack>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="inherit">
                        Cancel
                    </Button>
                    <LoadingButton
                        variant="contained"
                        loading={isSubmitting}
                        onClick={handleSaveCustomer}
                        disabled={loadingDetails || !customerData.fullName || !customerData.phone}
                    >
                        {editMode ? 'Update Customer' : 'Create Customer'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', variant: 'filled' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
