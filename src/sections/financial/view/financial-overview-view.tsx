import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  Box,
  Card,
  Chip,
  Select,
  Dialog,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { AnalyticsWidgetSummary } from '../../overview/analytics-widget-summary';
import { AnalyticsWebsiteVisits } from '../../overview/analytics-website-visits';
import { AnalyticsCurrentVisits } from '../../overview/analytics-current-visits';

// ----------------------------------------------------------------------

const PAYMENT_METHODS = ['cash', 'bank', 'mobile_money', 'credit_card', 'check'];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  credit_card: 'Credit Card',
  check: 'Check',
};

type TransactionType = 'credit' | 'debit';

const emptyForm = {
  transactionType: 'debit' as TransactionType,
  amount: '',
  description: '',
  paymentMethod: '',
  ledgerAccountId: '',
};

export function FinancialOverviewView() {
  const { user } = useAuth();

  const [overview, setOverview] = useState<any>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

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
    } catch (error: any) {
      console.error('Failed to fetch financial data:', error);
    }
  }, [selectedOutlet]);

  const fetchOutlets = useCallback(async () => {
    try {
      if (user?.businessId) {
        const data = await api.getOutlets(user.businessId);
        setOutlets(data);
      }
    } catch (error: any) {
      console.error('Failed to fetch outlets:', error);
    }
  }, [user?.businessId]);

  const fetchLedgerAccounts = useCallback(async () => {
    try {
      const data = await api.getLedgerAccounts();
      setLedgerAccounts(data);
    } catch (error: any) {
      console.error('Failed to fetch ledger accounts:', error);
    }
  }, []);

  useEffect(() => {
    fetchOutlets();
    fetchLedgerAccounts();
  }, [fetchOutlets, fetchLedgerAccounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: Number(formData.amount),
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        ...(formData.ledgerAccountId && { ledgerAccountId: formData.ledgerAccountId }),
      };

      if (formData.transactionType === 'credit') {
        await api.createCredit(payload);
      } else {
        await api.createDebit(payload);
      }

      fetchData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      alert(error?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const isCredit = formData.transactionType === 'credit';

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 5 }, gap: 2 }}>
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

        <Button
          variant="contained"
          startIcon={<Iconify icon={"mingcute:add-line" as any} />}
          onClick={handleOpenModal}
        >
          Add Transaction
        </Button>
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
                tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsCurrentVisits
            title="Expense Breakdown"
            chart={{
              series:
                expenseBreakdown.length > 0
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

      {/* Add Transaction Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            Add Transaction
            <Chip
              label={isCredit ? 'Money In (Credit)' : 'Money Out (Debit)'}
              color={isCredit ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {/* Transaction Type Toggle */}
          <FormControl fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={formData.transactionType}
              label="Transaction Type"
              onChange={(e) =>
                setFormData({ ...formData, transactionType: e.target.value as TransactionType, ledgerAccountId: '' })
              }
            >
              <MenuItem value="credit">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon={"mingcute:arrow-down-circle-fill" as any} color="success.main" />
                  Credit — Money In (capital, refunds, income)
                </Box>
              </MenuItem>
              <MenuItem value="debit">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon={"mingcute:arrow-up-circle-fill" as any} color="error.main" />
                  Debit — Money Out (expenses, purchases)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount *"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <TextField
            fullWidth
            label="Description *"
            placeholder={isCredit ? 'e.g., Owner capital injection' : 'e.g., Office rent for March'}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Payment Method *</InputLabel>
            <Select
              value={formData.paymentMethod}
              label="Payment Method *"
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Ledger Account (optional)</InputLabel>
            <Select
              value={formData.ledgerAccountId}
              label="Ledger Account (optional)"
              onChange={(e) => setFormData({ ...formData, ledgerAccountId: e.target.value })}
            >
              <MenuItem value="">
                <em>Auto-default</em>
              </MenuItem>
              {ledgerAccounts.map((account) => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name} ({account.code}) — {account.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            {isCredit
              ? 'If not selected, defaults to Sales Revenue (4001).'
              : 'If not selected, defaults to Utilities Expense (5200).'}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={isCredit ? 'success' : 'error'}
            disabled={loading}
            startIcon={<Iconify icon={(isCredit ? 'mingcute:arrow-down-circle-fill' : 'mingcute:arrow-up-circle-fill') as any} />}
          >
            {loading ? 'Saving...' : isCredit ? 'Record Credit' : 'Record Debit'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
