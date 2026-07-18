import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { fDate } from 'src/utils/format-time';
import { toTitleCase } from 'src/utils/format-text';
import { fCurrency } from 'src/utils/format-number';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAppSnackbar } from 'src/contexts/snackbar-context';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { PageHeader } from 'src/components/page-header';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { NumericInput } from 'src/components/numeric-input';

// ----------------------------------------------------------------------

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  OPEN: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'error',
  WRITTEN_OFF: 'default',
};

function customerContact(row: any) {
  const c = row?.customerId && typeof row.customerId === 'object' ? row.customerId : null;
  const rawName = c?.fullName || row?.customerName || '—';
  return {
    name: rawName === '—' ? '—' : toTitleCase(rawName),
    phone: c?.phone || row?.customerPhone || '',
    email: c?.email || row?.customerEmail || '',
  };
}

type StatusFilter = 'open' | 'paid' | 'all';

const STATUS_FILTER_PARAM: Record<StatusFilter, string | undefined> = {
  open: 'OPEN,PARTIAL,OVERDUE',
  paid: 'PAID',
  all: 'OPEN,PARTIAL,OVERDUE,PAID,WRITTEN_OFF',
};

export function ReceivablesView() {
  const { appData, outlets } = useAuth();
  const { showSuccess, showError } = useAppSnackbar();
  const businessId = appData?.businessId;
  const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';

  const [receivables, setReceivables] = useState<any[]>([]);
  const [aging, setAging] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedOutletId, setSelectedOutletId] = useState(
    isOwner ? '' : appData?.outletId || ''
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');

  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: 0, paymentMethod: 'cash', notes: '' });

  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [listRes, agingRes] = await Promise.all([
        api.getReceivables({
          outletId: selectedOutletId || undefined,
          status: STATUS_FILTER_PARAM[statusFilter],
          page: page + 1,
          limit: rowsPerPage,
        }),
        api.getReceivablesAging(),
      ]);
      setReceivables(listRes.data || []);
      setTotal(listRes.pagination?.total || 0);
      setAging(agingRes.buckets || []);
    } catch (error) {
      showError(formatError(error));
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedOutletId, statusFilter, page, rowsPerPage, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalOutstanding = receivables.reduce((sum, r) => sum + (r.outstandingAmount ?? 0), 0);

  const openPay = (row: any) => {
    setSelected(row);
    setPayForm({
      amount: row.outstandingAmount || 0,
      paymentMethod: 'cash',
      notes: '',
    });
    setPayOpen(true);
  };

  const handlePay = async () => {
    if (!selected?._id || payForm.amount <= 0) return;
    setPaying(true);
    try {
      const result = await api.payReceivable(selected._id, payForm);
      const paidOff = result?.receivable?.status === 'PAID' || result?.receivable?.outstandingAmount === 0;
      showSuccess(paidOff ? 'Payment recorded — debt marked paid.' : 'Payment recorded.');
      setPayOpen(false);
      fetchData();
    } catch (error) {
      showError(formatError(error));
    } finally {
      setPaying(false);
    }
  };

  const selectedCustomer = selected ? customerContact(selected) : null;

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Receivables' }]} sx={{ mb: 2 }} />

      <PageHeader
        kicker="Finance"
        title="Receivables"
        subtitle="Outstanding customer balances from credit and partial sales."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(0);
                }}
              >
                <MenuItem value="open">Open debts</MenuItem>
                <MenuItem value="paid">Paid history</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
            {isOwner ? (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Outlet</InputLabel>
                <Select
                  label="Outlet"
                  value={selectedOutletId}
                  onChange={(e) => {
                    setSelectedOutletId(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All outlets</MenuItem>
                  {outlets.map((o: any) => (
                    <MenuItem key={o.id || o._id} value={o.id || o._id}>
                      {toTitleCase(o.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Stack>
        }
      />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, bgcolor: statusFilter === 'paid' ? 'success.lighter' : 'warning.lighter' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {statusFilter === 'paid' ? 'Paid (this page)' : 'Page outstanding'}
            </Typography>
            <Typography
              variant="h4"
              color={statusFilter === 'paid' ? 'success.dark' : 'warning.dark'}
            >
              {fCurrency(totalOutstanding)}
            </Typography>
            <Typography variant="caption">
              {total} receivable{total === 1 ? '' : 's'}
              {statusFilter === 'open' ? ' open' : statusFilter === 'paid' ? ' paid' : ''}
            </Typography>
          </Paper>
        </Grid>
        {aging.slice(0, 2).map((bucket) => (
          <Grid key={bucket.label} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Aging · {bucket.label}
              </Typography>
              <Typography variant="h5">{fCurrency(bucket.totalOutstanding || 0)}</Typography>
              <Typography variant="caption">{bucket.count || 0} invoices</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minHeight: 360 }}>
            {loading ? (
              <Box sx={{ p: 3 }}>
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Sale</TableCell>
                    <TableCell align="right">Original</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receivables.map((row) => {
                    const customer = customerContact(row);
                    return (
                      <TableRow key={row._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {customer.name}
                          </Typography>
                          {customer.phone ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              <Link href={`tel:${customer.phone}`} underline="hover" color="inherit">
                                {customer.phone}
                              </Link>
                            </Typography>
                          ) : null}
                          {customer.email ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              <Link href={`mailto:${customer.email}`} underline="hover" color="inherit">
                                {customer.email}
                              </Link>
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">
                            {row.sourceSaleId?.saleNumber ||
                              String(row.sourceSaleId?._id || row.sourceSaleId || '').slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{fCurrency(row.originalAmount)}</TableCell>
                        <TableCell align="right">{fCurrency(row.outstandingAmount)}</TableCell>
                        <TableCell>{row.dueDate ? fDate(row.dueDate) : '—'}</TableCell>
                        <TableCell>
                          <Label color={STATUS_COLOR[row.status] || 'default'} variant="soft">
                            {row.status}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          {row.outstandingAmount > 0 && (
                            <Button size="small" onClick={() => openPay(row)}>
                              Collect
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!receivables.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          {statusFilter === 'paid' ? 'No paid receivables yet' : 'No receivables found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Card>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Collect payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectedCustomer && (
              <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                  {selectedCustomer.name}
                </Typography>
                {selectedCustomer.phone ? (
                  <Typography variant="body2">
                    <Link href={`tel:${selectedCustomer.phone}`}>{selectedCustomer.phone}</Link>
                  </Typography>
                ) : null}
                {selectedCustomer.email ? (
                  <Typography variant="body2">
                    <Link href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</Link>
                  </Typography>
                ) : null}
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Outstanding: {fCurrency(selected?.outstandingAmount || 0)}
            </Typography>
            <NumericInput
              fullWidth
              label="Amount"
              value={payForm.amount}
              onChangeValue={(v) => setPayForm({ ...payForm, amount: v })}
            />
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                label="Method"
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              value={payForm.notes}
              onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayOpen(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton variant="contained" loading={paying} onClick={handlePay}>
            Record payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
