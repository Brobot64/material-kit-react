import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { platformAdminApi } from '../api/platform-admin-api';

export default function PlatformPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await platformAdminApi.getPlans();
        if (!cancelled) setPlans(result);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load plans');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Plans</Typography>
        <Typography variant="body2" color="text.secondary">
          Subscription plan catalog (editor UI in a later phase)
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Duration (days)</TableCell>
                  <TableCell>Max outlets</TableCell>
                  <TableCell>Max users</TableCell>
                  <TableCell>Max products</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan._id || plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>
                      {plan.currency} {plan.price}
                    </TableCell>
                    <TableCell>{plan.durationInDays}</TableCell>
                    <TableCell>{plan.maxOutlets}</TableCell>
                    <TableCell>{plan.maxUsers}</TableCell>
                    <TableCell>{plan.maxProducts ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No plans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
