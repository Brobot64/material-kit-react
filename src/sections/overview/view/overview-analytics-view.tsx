import type { TimelineRangeValue } from 'src/utils/timeline-range';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { timelineRangeToQuery, createDefaultTimelineRange } from 'src/utils/timeline-range';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { TimelineFilter } from 'src/components/timeline-filter';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const { outlets, appData } = useAuth();
  const isOwner = appData?.role === 'owner';
  const assignedOutletId = appData?.outletId;

  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [timeline, setTimeline] = useState<TimelineRangeValue>(() => createDefaultTimelineRange('month'));

  const [overview, setOverview] = useState<any>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    setError(null);
    try {
      const dateParams = timelineRangeToQuery(timeline);
      const [overviewData, graphData, breakdownData, logsData] = await Promise.all([
        api.getFinancialOverview({ outletId: selectedOutletId, ...dateParams }),
        api.getIncomeExpenseGraph({ outletId: selectedOutletId, ...dateParams }),
        api.getExpenseBreakdownGraph({ outletId: selectedOutletId, ...dateParams }),
        api.getAuditLogs({
          outletId: selectedOutletId,
          limit: 10,
          startDate: dateParams.startDate,
          endDate: dateParams.endDate,
        }),
      ]);

      setOverview(overviewData);
      setIncomeExpenseData(graphData || []);
      setExpenseBreakdown(breakdownData || []);
      if (logsData) {
        setAuditLogs(logsData.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedOutletId, timeline]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      const initialId = assignedOutletId || outlets[0].id || outlets[0]._id;
      if (initialId) setSelectedOutletId(initialId);
    }
  }, [outlets, assignedOutletId, selectedOutletId]);

  if (loading && !overview) {
    return (
      <DashboardContent maxWidth="xl">
        <Skeleton variant="text" width={220} height={40} sx={{ mb: 5 }} />
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Typography variant="h4">Financial Analytics</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TimelineFilter value={timeline} onChange={setTimeline} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Outlet</InputLabel>
            <Select
              value={selectedOutletId}
              label="Select Outlet"
              onChange={(e) => setSelectedOutletId(e.target.value)}
              disabled={!isOwner}
            >
              {outlets.map((outlet: any) => (
                <MenuItem key={outlet.id || outlet._id} value={outlet.id || outlet._id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {error && (
        <Card sx={{ p: 3, mb: 3, bgcolor: 'error.lighter', color: 'error.darker' }}>
          <Typography variant="subtitle1">Dashboard Error</Typography>
          <Typography variant="body2">{error}</Typography>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Income"
            total={overview?.totalIncome || 0}
            percent={0}
            icon={<img alt="Income" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: incomeExpenseData.map((d) => d.label),
              series: incomeExpenseData.map((d) => d.income),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Expenses"
            total={overview?.totalExpenses || 0}
            color="error"
            percent={0}
            icon={<img alt="Expenses" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: incomeExpenseData.map((d) => d.label),
              series: incomeExpenseData.map((d) => d.expense),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Cash Liquidity"
            total={overview?.netProfit || 0}
            color="warning"
            percent={0}
            icon={<img alt="Profit" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: incomeExpenseData.map((d) => d.label),
              series: incomeExpenseData.map((d) => d.income - d.expense),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Receivables"
            total={overview?.totalReceivables || 0}
            color="info"
            percent={0}
            icon={<img alt="Receivables" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Income vs Expenses"
            subheader={`Performance · ${timeline.startDate} to ${timeline.endDate}`}
            chart={{
              categories: incomeExpenseData.map((d) => d.label),
              series: [
                { name: 'Money In', data: incomeExpenseData.map((d) => d.income) },
                { name: 'Money Out', data: incomeExpenseData.map((d) => d.expense) },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Expense Breakdown"
            chart={{
              series: expenseBreakdown.map((item) => ({
                label: item.label,
                value: item.value,
              })),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Outlet Financial Status</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Cash Balance</Typography>
                  <Typography variant="h4">₦{(overview?.cashBalance || 0).toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Bank Balance</Typography>
                  <Typography variant="h4">₦{(overview?.bankBalance || 0).toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Inventory Value</Typography>
                  <Typography variant="h4">₦{(overview?.inventoryValue || 0).toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Payables</Typography>
                  <Typography variant="h4">₦{(overview?.totalPayables || 0).toLocaleString()}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline
            title="Outlet Activities"
            list={auditLogs.map((log) => ({
              id: log._id,
              title: log.description || log.action,
              performer: log.userName || 'System',
              type: 'order1',
              time: log.createdAt,
            }))}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
