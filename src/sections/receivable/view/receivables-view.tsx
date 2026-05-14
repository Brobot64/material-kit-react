import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  OPEN: 'warning',
  PARTIAL: 'info',
  PAID: 'success',
  OVERDUE: 'error',
  WRITTEN_OFF: 'default',
};

export function ReceivablesView() {
  const { appData, outlets } = useAuth();
  const businessId = appData?.businessId;
  const isOwner = appData?.role === 'owner';

  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState(
    isOwner ? '' : (appData?.outletId || '')
  );

  const fetchPendingSales = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await api.getPendingSales({
        outletId: selectedOutletId || undefined,
      });
      setPendingSales(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Failed to load pending sales:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedOutletId]);

  useEffect(() => { fetchPendingSales(); }, [fetchPendingSales]);

  const totalOutstanding = pendingSales.reduce((sum, s) => sum + (s.amountPending ?? 0), 0);
  const overdueCount = pendingSales.filter((s) => s.status === 'overdue').length;

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Receivables' }]} sx={{ mb: 3 }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4">Receivables</Typography>
          <Typography variant="body2" color="text.secondary">
            Track outstanding customer balances
          </Typography>
        </Box>
      </Stack>

      {/* Summary cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'warning.lighter' }}>
            <Typography variant="subtitle2" color="text.secondary">Total Outstanding</Typography>
            <Typography variant="h4" color="warning.dark">{fCurrency(totalOutstanding)}</Typography>
            <Typography variant="caption" color="text.secondary">{pendingSales.length} open transactions</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'error.lighter' }}>
            <Typography variant="subtitle2" color="text.secondary">Overdue Transactions</Typography>
            <Typography variant="h4" color="error.dark">{overdueCount}</Typography>
            <Typography variant="caption" color="text.secondary">Past payment deadline</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'info.lighter' }}>
            <Typography variant="subtitle2" color="text.secondary">Partial Payments</Typography>
            <Typography variant="h4" color="info.dark">
              {pendingSales.filter((s) => s.status === 'partially_paid').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Partially collected</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sale #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Outlet</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton animation="wave" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pendingSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                      <Typography color="text.secondary">No outstanding balances</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingSales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>{fDateTime(sale.createdAt)}</TableCell>
                      <TableCell>{sale.saleNumber || sale._id?.slice(-6).toUpperCase()}</TableCell>
                      <TableCell>
                        {sale.customerId?.fullName || sale.customerId?.name || 'Walk-in'}
                      </TableCell>
                      <TableCell>
                        {sale.outletId?.name || '—'}
                      </TableCell>
                      <TableCell align="right">{fCurrency(sale.total)}</TableCell>
                      <TableCell align="right">{fCurrency(sale.amountPaid)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="error.main">
                          {fCurrency(sale.amountPending)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {sale.paymentDeadline ? (
                          <Typography
                            variant="body2"
                            color={new Date(sale.paymentDeadline) < new Date() ? 'error' : 'text.secondary'}
                          >
                            {fDateTime(sale.paymentDeadline)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Label variant="soft" color={STATUS_COLOR[sale.status?.toUpperCase()] || 'default'}>
                          {sale.status?.replace('_', ' ').toUpperCase()}
                        </Label>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}
