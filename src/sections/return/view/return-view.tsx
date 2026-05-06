import type { ProductReturn, ReturnStatus, ReturnTimelineEntry, WarrantyStatus } from 'src/types/return';
import type { IconifyName } from 'src/components/iconify/register-icons';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import InputLabel from '@mui/material/InputLabel';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { api } from 'src/services/api';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/contexts/auth-context';
import { useAppSnackbar } from 'src/contexts/snackbar-context';

// ----------------------------------------------------------------------

type StatusMeta = {
  label: string;
  color: 'default' | 'warning' | 'info' | 'success' | 'error' | 'primary' | 'secondary';
  icon: IconifyName;
};

const STATUS_META: Record<ReturnStatus, StatusMeta> = {
  received: { label: 'Received', color: 'warning', icon: 'eva:arrow-back-fill' },
  sent_to_distributor: { label: 'Sent to Distributor', color: 'info', icon: 'eva:cloud-upload-fill' },
  received_from_distributor: { label: 'Received Back', color: 'primary', icon: 'eva:checkmark-fill' },
  customer_notified: { label: 'Customer Notified', color: 'secondary', icon: 'solar:bell-bing-bold-duotone' },
  completed: { label: 'Completed', color: 'success', icon: 'solar:check-circle-bold' },
  refunded: { label: 'Refunded', color: 'error', icon: 'eva:trending-down-fill' },
  cancelled: { label: 'Cancelled', color: 'default', icon: 'eva:close-circle-fill' },
};

const WARRANTY_LABELS: Record<WarrantyStatus, string> = {
  under_warranty: 'Under Warranty',
  out_of_warranty: 'Out of Warranty',
  unknown: 'Unknown',
};

// ─── New Return Dialog ──────────────────────────────────────────────────────

function NewReturnDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { appData, outlets } = useAuth();
  const { showSuccess, showError } = useAppSnackbar();
  const [step, setStep] = useState<'sale' | 'item'>('sale');
  const [saleSearch, setSaleSearch] = useState('');
  const [loadingSale, setLoadingSale] = useState(false);
  const [saleData, setSaleData] = useState<{ sale: any; items: any[] } | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [form, setForm] = useState({ faultDescription: '', warrantyStatus: 'under_warranty' as WarrantyStatus, serialNumber: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const businessId = appData?.businessId || '';

  useEffect(() => {
    if (outlets.length > 0 && !outletId) setOutletId(outlets[0]._id);
  }, [outlets, outletId]);

  const handleReset = () => { setStep('sale'); setSaleSearch(''); setSaleData(null); setSelectedItemId(''); setForm({ faultDescription: '', warrantyStatus: 'under_warranty', serialNumber: '', notes: '' }); };

  const handleClose = () => { handleReset(); onClose(); };

  const lookupSale = async () => {
    if (!saleSearch.trim()) return;
    setLoadingSale(true);
    try {
      const res = await api.getSaleWithItems(saleSearch.trim());
      setSaleData(res);
      setStep('item');
    } catch (err: any) {
      showError(err.message || 'Sale not found. Try the exact Sale ID.');
    } finally {
      setLoadingSale(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItemId || !form.faultDescription) { showError('Select item and describe the fault'); return; }
    setSubmitting(true);
    try {
      await api.createReturn({
        businessId,
        outletId,
        originalSaleId: saleData!.sale._id,
        originalSaleItemId: selectedItemId,
        faultDescription: form.faultDescription,
        warrantyStatus: form.warrantyStatus,
        serialNumber: form.serialNumber || undefined,
        notes: form.notes || undefined,
      });
      showSuccess('Return recorded successfully');
      onCreated();
      handleClose();
    } catch (err: any) {
      showError(err.message || 'Failed to record return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 'sale' ? 'Record Return — Find Original Sale' : 'Record Return — Item Details'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {step === 'sale' ? (
            <>
              <Alert severity="info" sx={{ fontSize: 13 }}>
                Enter the Sale ID (from the receipt or sales history) to find the original sale.
              </Alert>
              <FormControl fullWidth size="small">
                <InputLabel>Outlet</InputLabel>
                <Select value={outletId} label="Outlet" onChange={(e) => setOutletId(e.target.value)}>
                  {outlets.map((o) => <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Sale ID"
                value={saleSearch}
                onChange={(e) => setSaleSearch(e.target.value)}
                size="small"
                placeholder="e.g. 68123abc..."
                onKeyDown={(e) => { if (e.key === 'Enter') lookupSale(); }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={lookupSale} disabled={loadingSale}>
                        {loadingSale ? <CircularProgress size={16} /> : <Iconify icon="eva:search-fill" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <>
              {saleData && (
                <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                  <Typography variant="caption" color="text.secondary">Original Sale</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {saleData.sale.saleNumber || saleData.sale._id.slice(-8).toUpperCase()} — {fCurrency(saleData.sale.total)} on {fDate(saleData.sale.createdAt)}
                  </Typography>
                  {saleData.sale.customerId?.fullName && (
                    <Typography variant="caption">Customer: {saleData.sale.customerId.fullName}</Typography>
                  )}
                </Card>
              )}

              <FormControl fullWidth size="small">
                <InputLabel>Defective Item *</InputLabel>
                <Select value={selectedItemId} label="Defective Item *" onChange={(e) => setSelectedItemId(e.target.value)}>
                  {(saleData?.items || []).map((item: any) => {
                    const product = typeof item.productId === 'object' ? item.productId : { name: item.productNameSnapshot || 'Product' };
                    return (
                      <MenuItem key={item._id} value={item._id}>
                        {item.productNameSnapshot || product.name} × {item.quantity} @ {fCurrency(item.unitPrice)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Warranty Status</InputLabel>
                <Select
                  value={form.warrantyStatus}
                  label="Warranty Status"
                  onChange={(e) => setForm((p) => ({ ...p, warrantyStatus: e.target.value as WarrantyStatus }))}
                >
                  <MenuItem value="under_warranty">Under Warranty</MenuItem>
                  <MenuItem value="out_of_warranty">Out of Warranty</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Serial / IMEI Number"
                value={form.serialNumber}
                onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))}
                size="small"
                placeholder="Optional but helpful for tracking"
              />

              <TextField
                fullWidth
                required
                label="Fault Description *"
                value={form.faultDescription}
                onChange={(e) => setForm((p) => ({ ...p, faultDescription: e.target.value }))}
                size="small"
                multiline
                rows={3}
                placeholder="Describe what the customer says is wrong..."
              />

              <TextField
                fullWidth
                label="Internal Notes"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                size="small"
                multiline
                rows={2}
              />

              <Button size="small" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={() => setStep('sale')}>
                Change sale
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {step === 'sale' ? (
          <Button variant="contained" onClick={lookupSale} disabled={loadingSale || !saleSearch.trim()}>
            {loadingSale ? <CircularProgress size={18} /> : 'Find Sale'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={18} /> : 'Record Return'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Action Dialogs ─────────────────────────────────────────────────────────

type ActionDialogProps = { open: boolean; onClose: () => void; onDone: (updated: ProductReturn) => void; returnId: string };

function SendToDistributorDialog({ open, onClose, onDone, returnId }: ActionDialogProps) {
  const { appData } = useAuth();
  const { showError } = useAppSnackbar();
  const [form, setForm] = useState({ distributorName: '', distributorContact: '', distributorReferenceNo: '', note: '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.distributorName) { showError('Distributor name is required'); return; }
    setLoading(true);
    try {
      const res = await api.sendToDistributor(returnId, { distributorName: form.distributorName, distributorContact: form.distributorContact || undefined, distributorReferenceNo: form.distributorReferenceNo || undefined, note: form.note || undefined });
      onDone(res.data);
      onClose();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Send to Distributor</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField fullWidth label="Distributor Name *" value={form.distributorName} onChange={set('distributorName')} size="small" placeholder="e.g. FOAUNI" />
          <TextField fullWidth label="Contact / Phone" value={form.distributorContact} onChange={set('distributorContact')} size="small" />
          <TextField fullWidth label="Reference / Job No." value={form.distributorReferenceNo} onChange={set('distributorReferenceNo')} size="small" />
          <TextField fullWidth label="Note" value={form.note} onChange={set('note')} size="small" multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="info" onClick={submit} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ReceiveFromDistributorDialog({ open, onClose, onDone, returnId }: ActionDialogProps) {
  const { showError } = useAppSnackbar();
  const [resolution, setResolution] = useState<'repaired' | 'replaced' | 'no_fault_found'>('repaired');
  const [distributorNotes, setDistributorNotes] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.receiveFromDistributor(returnId, { resolution, distributorNotes: distributorNotes || undefined, note: note || undefined });
      onDone(res.data);
      onClose();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Receive from Distributor</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Resolution *</InputLabel>
            <Select value={resolution} label="Resolution *" onChange={(e) => setResolution(e.target.value as any)}>
              <MenuItem value="repaired">Repaired</MenuItem>
              <MenuItem value="replaced">Replaced with new unit</MenuItem>
              <MenuItem value="no_fault_found">No fault found</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Distributor Notes" value={distributorNotes} onChange={(e) => setDistributorNotes(e.target.value)} size="small" multiline rows={2} placeholder="What did the distributor say?" />
          <TextField fullWidth label="Internal Note" value={note} onChange={(e) => setNote(e.target.value)} size="small" multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function NotifyCustomerDialog({ open, onClose, onDone, returnId }: ActionDialogProps) {
  const { showError } = useAppSnackbar();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.notifyCustomer(returnId, { note: note || undefined });
      onDone(res.data);
      onClose();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Notify Customer</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ fontSize: 13 }}>If the customer has an account, they will receive an in-app notification automatically.</Alert>
          <TextField fullWidth label="Message / Note" value={note} onChange={(e) => setNote(e.target.value)} size="small" multiline rows={3} placeholder="e.g. Your Hisense TV has been repaired. Please come in during business hours." />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={submit} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Mark Notified'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function CompleteReturnDialog({ open, onClose, onDone, returnId }: ActionDialogProps) {
  const { showError } = useAppSnackbar();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.completeReturn(returnId, { note: note || undefined });
      onDone(res.data);
      onClose();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Complete Return — Customer Pickup</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="success" sx={{ fontSize: 13 }}>Confirm the customer has collected the product. This closes the return case.</Alert>
          <TextField fullWidth label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={submit} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Confirm Pickup'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProcessRefundDialog({ open, onClose, onDone, returnId }: ActionDialogProps) {
  const { showError } = useAppSnackbar();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!amount) { showError('Enter refund amount'); return; }
    setLoading(true);
    try {
      const res = await api.processRefund(returnId, { refundAmount: amount, refundMethod: method, note: note || undefined });
      onDone(res.data);
      onClose();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Process Refund</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Refund Amount *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Payment Method</InputLabel>
            <Select value={method} label="Payment Method" onChange={(e) => setMethod(e.target.value)}>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="transfer">Bank Transfer</MenuItem>
              <MenuItem value="card">Card</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Note" value={note} onChange={(e) => setNote(e.target.value)} size="small" multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={submit} disabled={loading}>{loading ? <CircularProgress size={18} /> : 'Process Refund'}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Return Detail Drawer ───────────────────────────────────────────────────

type ActiveDialog = 'send' | 'receive' | 'notify' | 'complete' | 'refund' | 'cancel' | null;

const TIMELINE_DOT_COLORS: Record<ReturnStatus, 'grey' | 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error' | 'inherit'> = {
  received: 'warning',
  sent_to_distributor: 'info',
  received_from_distributor: 'primary',
  customer_notified: 'secondary',
  completed: 'success',
  refunded: 'error',
  cancelled: 'grey',
};

function ReturnDetailDrawer({
  ret,
  onClose,
  onUpdated,
}: {
  ret: ProductReturn;
  onClose: () => void;
  onUpdated: (updated: ProductReturn) => void;
}) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const close = () => setActiveDialog(null);
  const done = (updated: ProductReturn) => { onUpdated(updated); close(); };

  const actionDialogProps: ActionDialogProps = { open: true, onClose: close, onDone: done, returnId: ret._id };

  const nextAction: { label: string; color: 'info' | 'primary' | 'secondary' | 'success' | 'error'; dialog: ActiveDialog } | null = (() => {
    switch (ret.status) {
      case 'received': return { label: 'Send to Distributor', color: 'info', dialog: 'send' };
      case 'sent_to_distributor': return { label: 'Receive from Distributor', color: 'primary', dialog: 'receive' };
      case 'received_from_distributor': return { label: 'Notify Customer', color: 'secondary', dialog: 'notify' };
      case 'customer_notified': return { label: 'Complete — Customer Picked Up', color: 'success', dialog: 'complete' };
      default: return null;
    }
  })();

  const canRefund = !['completed', 'refunded', 'cancelled'].includes(ret.status);
  const canCancel = ['received', 'sent_to_distributor'].includes(ret.status);

  const meta = STATUS_META[ret.status];

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3, overflowY: 'auto' } }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Return {ret.returnNumber}</Typography>
        <IconButton onClick={onClose}><Iconify icon="eva:close-fill" /></IconButton>
      </Stack>

      {/* Status badge */}
      <Chip
        icon={<Iconify icon={meta.icon} width={16} />}
        label={meta.label}
        color={meta.color}
        sx={{ mb: 2, width: 'fit-content', fontWeight: 600 }}
      />

      {/* Product & Customer */}
      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Product</Typography>
        <Typography variant="body2" fontWeight={600}>{ret.productNameSnapshot}</Typography>
        {ret.skuSnapshot && <Typography variant="caption" color="text.secondary">SKU: {ret.skuSnapshot}</Typography>}
        {ret.serialNumber && <><br /><Typography variant="caption" color="text.secondary">S/N: {ret.serialNumber}</Typography></>}
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Fault Reported</Typography>
        <Typography variant="body2" color="text.secondary">{ret.faultDescription}</Typography>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography variant="caption" color="text.disabled">Warranty</Typography>
            <Typography variant="body2">{WARRANTY_LABELS[ret.warrantyStatus]}</Typography>
          </Box>
          {ret.customerName && (
            <Box>
              <Typography variant="caption" color="text.disabled">Customer</Typography>
              <Typography variant="body2">{ret.customerName}</Typography>
              {ret.customerPhone && <Typography variant="caption" color="text.secondary"> · {ret.customerPhone}</Typography>}
            </Box>
          )}
        </Stack>
        {ret.distributorName && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.disabled">Distributor</Typography>
            <Typography variant="body2">{ret.distributorName}</Typography>
            {ret.distributorReferenceNo && <Typography variant="caption" color="text.secondary">Ref: {ret.distributorReferenceNo}</Typography>}
          </>
        )}
        {ret.resolution !== 'pending' && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.disabled">Resolution</Typography>
            <Typography variant="body2" textTransform="capitalize">{ret.resolution.replace(/_/g, ' ')}</Typography>
          </>
        )}
        {ret.refundAmount != null && (
          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>Refund: {fCurrency(ret.refundAmount)} via {ret.refundMethod}</Typography>
        )}
      </Card>

      {/* Next action */}
      {nextAction && (
        <Button
          fullWidth
          variant="contained"
          color={nextAction.color}
          onClick={() => setActiveDialog(nextAction.dialog)}
          sx={{ mb: 1 }}
        >
          {nextAction.label}
        </Button>
      )}
      {canRefund && (
        <Button fullWidth variant="outlined" color="error" onClick={() => setActiveDialog('refund')} sx={{ mb: 1 }}>
          Process Refund Instead
        </Button>
      )}
      {canCancel && (
        <Button fullWidth variant="text" color="error" onClick={() => setActiveDialog('cancel')} sx={{ mb: 2 }}>
          Cancel Return
        </Button>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Timeline */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Activity Timeline</Typography>
      <Timeline position="right" sx={{ p: 0, m: 0 }}>
        {[...ret.timeline].reverse().map((entry: ReturnTimelineEntry, idx) => (
          <TimelineItem key={idx} sx={{ '&::before': { flex: 0, p: 0 } }}>
            <TimelineSeparator>
              <TimelineDot color={TIMELINE_DOT_COLORS[entry.status]} variant="outlined" />
              {idx < ret.timeline.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: 0, px: 2, pb: 2 }}>
              <Typography variant="caption" color="text.disabled" display="block">
                {fDateTime(entry.timestamp)}
              </Typography>
              <Chip
                label={STATUS_META[entry.status]?.label || entry.status}
                size="small"
                color={STATUS_META[entry.status]?.color || 'default'}
                sx={{ my: 0.25, height: 20, fontSize: 11 }}
              />
              {entry.note && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {entry.note}
                </Typography>
              )}
              {entry.actorName && (
                <Typography variant="caption" color="text.disabled">
                  by {entry.actorName}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Action dialogs */}
      {activeDialog === 'send' && <SendToDistributorDialog {...actionDialogProps} />}
      {activeDialog === 'receive' && <ReceiveFromDistributorDialog {...actionDialogProps} />}
      {activeDialog === 'notify' && <NotifyCustomerDialog {...actionDialogProps} />}
      {activeDialog === 'complete' && <CompleteReturnDialog {...actionDialogProps} />}
      {activeDialog === 'refund' && <ProcessRefundDialog {...actionDialogProps} />}
      {activeDialog === 'cancel' && (
        <Dialog open onClose={close} maxWidth="xs" fullWidth>
          <DialogTitle>Cancel Return</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel this return record?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>No</Button>
            <Button color="error" variant="contained" onClick={async () => {
              try {
                const res = await api.cancelReturn(ret._id, {});
                done(res.data);
              } catch (err: any) { }
            }}>Yes, Cancel</Button>
          </DialogActions>
        </Dialog>
      )}
    </Drawer>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ value: ReturnStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'sent_to_distributor', label: 'With Distributor' },
  { value: 'received_from_distributor', label: 'Received Back' },
  { value: 'customer_notified', label: 'Customer Notified' },
  { value: 'completed', label: 'Completed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ReturnView() {
  const { appData } = useAuth();
  const { showError } = useAppSnackbar();
  const [returns, setReturns] = useState<ProductReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<ProductReturn | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getReturns({ status: statusFilter || undefined });
      setReturns(res.data);
    } catch (err: any) {
      showError(err.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showError]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleUpdated = (updated: ProductReturn) => {
    setReturns((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setSelected(updated);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Returns & Warranty</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setNewOpen(true)}>
          Record Return
        </Button>
      </Stack>

      {/* Status filter chips */}
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            size="small"
            color={f.value === statusFilter ? 'primary' : 'default'}
            variant={f.value === statusFilter ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter(f.value)}
          />
        ))}
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : returns.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Iconify icon="solar:restart-bold" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No returns found</Typography>
            <Typography variant="body2" color="text.disabled">Returns will appear here when customers bring back products</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Return #</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Warranty</TableCell>
                  <TableCell>Distributor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returns.map((ret) => {
                  const meta = STATUS_META[ret.status];
                  return (
                    <TableRow
                      key={ret._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelected(ret)}
                    >
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
                          {ret.returnNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{ret.productNameSnapshot}</Typography>
                        {ret.skuSnapshot && <Typography variant="caption" color="text.secondary">{ret.skuSnapshot}</Typography>}
                        {ret.serialNumber && <><br /><Typography variant="caption" color="text.disabled">S/N: {ret.serialNumber}</Typography></>}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ret.customerName || '—'}</Typography>
                        {ret.customerPhone && <Typography variant="caption" color="text.secondary">{ret.customerPhone}</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={WARRANTY_LABELS[ret.warrantyStatus]}
                          size="small"
                          variant="outlined"
                          color={ret.warrantyStatus === 'under_warranty' ? 'success' : ret.warrantyStatus === 'out_of_warranty' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {ret.distributorName ? (
                          <Typography variant="body2">{ret.distributorName}</Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Iconify icon={meta.icon} width={14} />}
                          label={meta.label}
                          size="small"
                          color={meta.color}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{fDate(ret.createdAt)}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <NewReturnDialog open={newOpen} onClose={() => setNewOpen(false)} onCreated={fetchReturns} />
      {selected && (
        <ReturnDetailDrawer
          ret={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </Box>
  );
}
