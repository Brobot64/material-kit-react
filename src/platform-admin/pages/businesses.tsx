import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';

import { Iconify } from 'src/components/iconify';

import {
  platformAdminApi,
  type PlatformBusinessListItem,
} from '../api/platform-admin-api';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  if (status === 'suspended') return 'error';
  return 'default';
}

export default function PlatformBusinessesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PlatformBusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionBusy, setActionBusy] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<PlatformBusinessListItem | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(14);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.listBusinesses({
        page,
        limit: 20,
        status: status || undefined,
        search: search || undefined,
      });
      setRows(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionBusy(true);
    setError('');
    try {
      await fn();
      closeMenu();
      setExtendOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Businesses</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage tenant subscriptions and account status
        </Typography>
      </Box>

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => load()} startIcon={<Iconify icon="solar:restart-bold" />}>
            Refresh
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscription end</TableCell>
                  <TableCell>Last login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => navigate(`/admin/businesses/${row.id}`)}
                        sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      >
                        {row.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.owner?.fullName || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.owner?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.plan?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={statusColor(row.status)} />
                    </TableCell>
                    <TableCell>{formatDate(row.subscriptionEnd)}</TableCell>
                    <TableCell>{formatDate(row.lastLoginAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setSelected(row);
                          setMenuAnchor(e.currentTarget);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No businesses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {page} / {totalPages}
          </Typography>
          <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Stack>
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          disabled={actionBusy || !selected}
          onClick={() =>
            selected &&
            runAction(() =>
              platformAdminApi.updateStatus(
                selected.id,
                selected.status === 'active' ? 'suspended' : 'active'
              )
            )
          }
        >
          {selected?.status === 'active' ? 'Suspend' : 'Activate'}
        </MenuItem>
        <MenuItem
          disabled={actionBusy || !selected}
          onClick={() => {
            closeMenu();
            setExtendOpen(true);
          }}
        >
          Extend trial
        </MenuItem>
        <MenuItem
          disabled={actionBusy || !selected}
          onClick={() => selected && runAction(() => platformAdminApi.markPaid(selected.id))}
        >
          Mark paid / renew
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selected) navigate(`/admin/businesses/${selected.id}`);
            closeMenu();
          }}
        >
          View detail
        </MenuItem>
      </Menu>

      <Dialog open={extendOpen} onClose={() => setExtendOpen(false)}>
        <DialogTitle>Extend trial — {selected?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Days"
            type="number"
            fullWidth
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            inputProps={{ min: 1, max: 365 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={actionBusy || !selected}
            onClick={() =>
              selected && runAction(() => platformAdminApi.extendTrial(selected.id, extendDays))
            }
          >
            Extend
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
