import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box, Card, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import { api } from 'src/services/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from '../../overview/analytics-widget-summary';
import { AnalyticsWebsiteVisits } from '../../overview/analytics-website-visits';
import { AnalyticsCurrentVisits } from '../../overview/analytics-current-visits';

// ----------------------------------------------------------------------

export function FinancialOverviewView() {
  const [overview, setOverview] = useState<any>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const params = {
        outletId: selectedOutlet === 'all' ? undefined : selectedOutlet,
      };

      const [overviewData, graphData, breakdownData] = await Promise.all([
        api.getFinancialOverview(params),
        api.getIncomeExpenseGraph(params),
        api.getExpenseBreakdownGraph(params),
      ]);

      setOverview(overviewData);
      setIncomeExpenseData(graphData);
      setExpenseBreakdown(breakdownData);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  }, [selectedOutlet]);

  const fetchOutlets = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.businessId) {
        const data = await api.getOutlets(user.businessId);
        setOutlets(data);
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  }, []);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Financial Overview
        </Typography>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Outlet</InputLabel>
          <Select
            value={selectedOutlet}
            label="Outlet"
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            <MenuItem value="all">All Outlets</MenuItem>
            {outlets.map((outlet) => (
              <MenuItem key={outlet._id} value={outlet._id}>
                {outlet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Income"
            percent={0}
            total={overview?.totalIncome || 0}
            icon={<img alt="Income" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{ series: [], categories: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Expenses"
            percent={0}
            total={overview?.totalExpenses || 0}
            color="error"
            icon={<img alt="Expenses" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{ series: [], categories: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Net Profit"
            percent={0}
            total={overview?.netProfit || 0}
            color="success"
            icon={<img alt="Profit" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{ series: [], categories: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Cash Balance"
            percent={0}
            total={overview?.cashBalance || 0}
            color="warning"
            icon={<img alt="Cash" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{ series: [], categories: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <AnalyticsWebsiteVisits
            title="Income vs Expenses"
            subheader="Monthly performance"
            chart={{
              categories: incomeExpenseData.map((item) => item.label),
              series: [
                {
                  name: 'Income',
                  data: incomeExpenseData.map((item) => item.income),
                },
                {
                  name: 'Expenses',
                  data: incomeExpenseData.map((item) => item.expense),
                },
              ],
              options: {
                tooltip: { y: { formatter: (value: number) => formatCurrency(value) } }
              }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsCurrentVisits
            title="Expense Breakdown"
            chart={{
              series: expenseBreakdown.length > 0
                ? expenseBreakdown.map((item) => ({ label: item.label, value: item.value }))
                : [{ label: 'No Expenses', value: 0 }],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Receivables
            </Typography>
            <Typography variant="h4">{formatCurrency(overview?.totalReceivables || 0)}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Payables
            </Typography>
            <Typography variant="h4">{formatCurrency(overview?.totalPayables || 0)}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Inventory Value
            </Typography>
            <Typography variant="h4">{formatCurrency(overview?.inventoryValue || 0)}</Typography>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
