import type { IconifyName } from 'src/components/iconify/register-icons';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency, fPercent } from 'src/utils/format-number';
import { api } from 'src/services/api';
import { Chart, useChart } from 'src/components/chart';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/contexts/auth-context';
import { useAppSnackbar } from 'src/contexts/snackbar-context';

// ----------------------------------------------------------------------

function SummaryCard({
  title,
  value,
  icon,
  color = 'primary',
}: {
  title: string;
  value: string;
  icon: IconifyName;
  color?: string;
}) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
          }}
        >
          <Iconify icon={icon} width={28} sx={{ color: `${color}.main` }} />
        </Box>
        <Box>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function BargainingAnalyticsView() {
  const { showError } = useAppSnackbar();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getBargainingAnalytics({ startDate, endDate });
      setData(res);
    } catch (err: any) {
      showError(err.message || 'Failed to load bargaining analytics');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, showError]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const overTimeChartOptions = useChart({
    xaxis: {
      categories: data?.overTime?.map((d: any) => d._id) ?? [],
      labels: { rotate: -45 },
    },
    tooltip: { y: { formatter: (v: number) => `${v} overrides` } },
  });

  const decisionChartOptions = useChart({
    labels: data?.byDecision?.map((d: any) => d._id) ?? [],
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (v: number) => `${v} times` } },
  });

  const decisionChartSeries: number[] = data?.byDecision?.map((d: any) => d.count) ?? [];
  const overTimeSeries = [{ name: 'Overrides', data: data?.overTime?.map((d: any) => d.count) ?? [] }];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const summary = data?.summary || {};

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Bargaining Analytics</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            label="From"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Total Price Overrides"
            value={String(summary.totalOverrides ?? 0)}
            icon="solar:cart-3-bold"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Avg Discount Given"
            value={fPercent(summary.avgDiscountPercent ?? 0)}
            icon="eva:trending-down-fill"
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Total Margin Impact"
            value={fCurrency(summary.totalMarginalLoss ?? 0)}
            icon="eva:trending-down-fill"
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Override Frequency Over Time" />
            <CardContent>
              {data?.overTime?.length > 0 ? (
                <Chart
                  type="bar"
                  series={overTimeSeries}
                  options={overTimeChartOptions}
                  sx={{ height: 280 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No data for this period</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="By Decision Type" />
            <CardContent>
              {decisionChartSeries.length > 0 ? (
                <Chart
                  type="donut"
                  series={decisionChartSeries}
                  options={decisionChartOptions}
                  sx={{ height: 280 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Most Negotiated Products" />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Overrides</TableCell>
                    <TableCell align="right">Avg Price</TableCell>
                    <TableCell align="right">Margin Lost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.topNegotiatedProducts ?? []).map((p: any) => (
                    <TableRow key={p._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{p.productName || 'Unknown'}</Typography>
                        {p.sku && <Typography variant="caption" color="text.secondary">{p.sku}</Typography>}
                      </TableCell>
                      <TableCell align="right">{p.overrideCount}</TableCell>
                      <TableCell align="right">{fCurrency(p.avgFinalPrice)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">{fCurrency(p.totalMarginalLoss)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data?.topNegotiatedProducts?.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Discount Rate by Salesperson" />
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Salesperson</TableCell>
                    <TableCell align="right">Overrides</TableCell>
                    <TableCell align="right">Avg Discount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.byCashier ?? []).map((c: any) => (
                    <TableRow key={c._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{c.actorName || 'Unknown'}</Typography>
                      </TableCell>
                      <TableCell align="right">{c.overrideCount}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={c.avgDiscountPercent > 10 ? 'error.main' : 'text.primary'}
                          fontWeight={c.avgDiscountPercent > 10 ? 600 : 400}
                        >
                          {fPercent(c.avgDiscountPercent ?? 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data?.byCashier?.length && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No data for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
