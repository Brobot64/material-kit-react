import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { platformAdminApi } from '../api/platform-admin-api';

type Audience = 'all_owners' | 'active' | 'expired';

export default function PlatformEmailPage() {
  const [audience, setAudience] = useState<Audience>('all_owners');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [sample, setSample] = useState<Array<{ email: string; fullName: string }>>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setError('');
    try {
      const data = await platformAdminApi.previewEmailAudience(audience);
      setPreviewCount(data.recipientCount);
      setSample(data.sample || []);
    } catch (err: any) {
      setError(err.message || 'Failed to preview audience');
    } finally {
      setLoadingPreview(false);
    }
  }, [audience]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const send = async () => {
    if (!window.confirm(`Send email to ~${previewCount ?? 0} recipients?`)) return;
    setBusy(true);
    setError('');
    setResult('');
    try {
      const res = await platformAdminApi.sendBulkEmail({
        audience,
        subject: subject.trim(),
        body: body.trim(),
      });
      setResult(`Sent ${res.sent} of ${res.recipientCount} (${res.failed} failed).`);
    } catch (err: any) {
      setError(err.message || 'Failed to send bulk email');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Bulk email</Typography>
        <Typography variant="body2" color="text.secondary">
          Transactional email to business owners via Resend (chunked + audited)
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {result && <Alert severity="success">{result}</Alert>}

      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Audience</InputLabel>
            <Select
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
            >
              <MenuItem value="all_owners">All owners</MenuItem>
              <MenuItem value="active">Active subscriptions</MenuItem>
              <MenuItem value="expired">Expired / inactive</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={loadPreview} disabled={loadingPreview}>
              Refresh audience
            </Button>
            {loadingPreview ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {previewCount ?? 0} recipients
              </Typography>
            )}
          </Stack>

          {sample.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Sample: {sample.map((s) => s.email).join(', ')}
            </Typography>
          )}

          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            required
            multiline
            minRows={6}
            helperText="Plain text; line breaks become HTML breaks"
          />

          <Box>
            <Button
              variant="contained"
              disabled={busy || !subject.trim() || !body.trim() || !previewCount}
              onClick={send}
            >
              Send bulk email
            </Button>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
