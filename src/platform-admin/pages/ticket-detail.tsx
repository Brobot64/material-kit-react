import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/contexts/auth-context';

import { platformAdminApi, type PlatformTicketDetail } from '../api/platform-admin-api';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG');
}

export default function PlatformTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<PlatformTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const result = await platformAdminApi.getTicket(id);
      setData(result);
      setStatus(result.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Alert severity="error">{error || 'Ticket not found'}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate('/admin/tickets')}
        >
          Back
        </Button>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {data.subject}
        </Typography>
        <Chip label={data.status.replace('_', ' ')} color="info" />
        <Chip label={data.priority} variant="outlined" />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2">
              Business:{' '}
              {data.business?.id ? (
                <Button
                  size="small"
                  sx={{ textTransform: 'none' }}
                  onClick={() => navigate(`/admin/businesses/${data.business!.id}`)}
                >
                  {data.business.name || data.business.id}
                </Button>
              ) : (
                '—'
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created by {data.createdBy?.fullName || '—'} · {formatDate(data.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assignee: {data.assignee?.fullName || 'Unassigned'}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.value;
                setStatus(next);
                run(() => platformAdminApi.updateTicketStatus(data.id, next));
              }}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="waiting">Waiting</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            disabled={busy || !user?.id}
            onClick={() =>
              run(() =>
                platformAdminApi.assignTicket(
                  data.id,
                  data.assignee?.id === (user?.id || user?._id)
                    ? null
                    : (user?.id || user?._id || null)
                )
              )
            }
          >
            {data.assignee?.id === (user?.id || user?._id) ? 'Unassign me' : 'Assign to me'}
          </Button>
        </Stack>
      </Card>

      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thread
        </Typography>
        <Stack spacing={2}>
          {data.messages?.length ? (
            data.messages.map((msg) => (
              <Paper
                key={msg.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: msg.authorType === 'platform' ? 'action.hover' : 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label={msg.authorType}
                    color={msg.authorType === 'platform' ? 'primary' : 'default'}
                  />
                  <Typography variant="subtitle2">{msg.author?.fullName || 'Unknown'}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {formatDate(msg.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.body}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={1.5}>
          <TextField
            label="Reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            disabled={busy || data.status === 'closed'}
          />
          <Box>
            <Button
              variant="contained"
              disabled={busy || !reply.trim() || data.status === 'closed'}
              onClick={() =>
                run(async () => {
                  await platformAdminApi.addTicketMessage(data.id, reply.trim());
                  setReply('');
                })
              }
            >
              Send reply
            </Button>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
