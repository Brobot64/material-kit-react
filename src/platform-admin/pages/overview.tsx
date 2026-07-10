import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { platformAdminApi, type PlatformDashboard } from '../api/platform-admin-api';

function formatNgn(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card sx={{ p: 2.5, height: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Card>
  );
}

export default function PlatformOverviewPage() {
  const [data, setData] = useState<PlatformDashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await platformAdminApi.getDashboard();
        if (!cancelled) setData(result);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) return null;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Overview</Typography>
        <Typography variant="body2" color="text.secondary">
          Platform health across all ShopMaster tenants
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="Active businesses" value={data.activeBusinesses} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="New signups (7d)" value={data.newSignupsWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="New signups (30d)" value={data.newSignupsMonth} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="Estimated MRR" value={formatNgn(data.mrr)} hint="Active × plan price / month" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="Estimated ARR" value={formatNgn(data.arr)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="Failed / expired renewals" value={data.failedRenewals} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="Owners" value={data.users.ownersCount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="New users (7d)" value={data.users.newUsersWeek} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard label="New users (30d)" value={data.users.newUsersMonth} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            label="Inventory value processed (30d)"
            value={formatNgn(data.inventory?.totalInventoryValueProcessed || 0)}
            hint={`${data.inventory?.movementCount ?? 0} stock movements`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard
            label="On-hand inventory value"
            value={formatNgn(data.inventory?.totalOnHandValue || 0)}
            hint="Sum of WAC × qty across tenants"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
