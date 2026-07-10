import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

import { Iconify } from 'src/components/iconify';

import {
  platformAdminApi,
  type PlatformTicketListItem,
} from '../api/platform-admin-api';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: string): 'default' | 'info' | 'warning' | 'success' | 'error' {
  if (status === 'open') return 'info';
  if (status === 'in_progress') return 'warning';
  if (status === 'waiting') return 'default';
  if (status === 'resolved') return 'success';
  if (status === 'closed') return 'error';
  return 'default';
}

function priorityColor(priority: string): 'default' | 'info' | 'warning' | 'error' {
  if (priority === 'urgent') return 'error';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'default';
}

export default function PlatformTicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillBusinessId = searchParams.get('businessId') || '';

  const [rows, setRows] = useState<PlatformTicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [createOpen, setCreateOpen] = useState(Boolean(prefillBusinessId));
  const [createBusy, setCreateBusy] = useState(false);
  const [form, setForm] = useState({
    businessId: prefillBusinessId,
    subject: '',
    body: '',
    priority: 'medium',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.listTickets({
        page,
        limit: 20,
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
        businessId: prefillBusinessId || undefined,
      });
      setRows(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, prefillBusinessId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreateBusy(true);
    setError('');
    try {
      const ticket = await platformAdminApi.createTicket({
        businessId: form.businessId.trim(),
        subject: form.subject.trim(),
        body: form.body.trim() || undefined,
        priority: form.priority,
      });
      setCreateOpen(false);
      setForm({ businessId: '', subject: '', body: '', priority: 'medium' });
      navigate(`/admin/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Tickets</Typography>
          <Typography variant="body2" color="text.secondary">
            Platform support inbox linked to tenant businesses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateOpen(true)}
        >
          New ticket
        </Button>
      </Box>

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Search subject"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="waiting">Waiting</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => {
                setPage(1);
                setPriority(e.target.value);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => load()}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
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
                  <TableCell>Subject</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/tickets/${row.id}`)}>
                    <TableCell>
                      <Typography variant="subtitle2">{row.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.channel}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.business?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status.replace('_', ' ')} color={statusColor(row.status)} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.priority} color={priorityColor(row.priority)} variant="outlined" />
                    </TableCell>
                    <TableCell>{row.assignee?.fullName || '—'}</TableCell>
                    <TableCell>{formatDate(row.updatedAt || row.lastMessageAt)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No tickets found
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

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create support ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Business ID"
              value={form.businessId}
              onChange={(e) => setForm((f) => ({ ...f, businessId: e.target.value }))}
              fullWidth
              required
              helperText="Mongo ObjectId of the tenant business"
            />
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Initial note"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={createBusy || !form.businessId.trim() || !form.subject.trim()}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
