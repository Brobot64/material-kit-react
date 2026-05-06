import type { Stocktake, StocktakeItem } from 'src/types/stocktake';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  IN_PROGRESS: 'info',
  SUBMITTED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

// Handles both populated `{ _id, name }` and plain string IDs
function extractProductId(productId: any): string {
  if (!productId) return '';
  if (typeof productId === 'string') return productId;
  return productId._id?.toString() ?? productId.toString();
}

function extractProductName(item: StocktakeItem): string {
  const doc = item.productId as any;
  return doc?.name ?? item.productName ?? 'Unknown';
}

function extractProductSku(item: StocktakeItem): string {
  const doc = item.productId as any;
  return doc?.sku ?? item.sku ?? '';
}

function ProgressBar({ counted, total }: { counted: number; total: number }) {
  const pct = total > 0 ? Math.round((counted / total) * 100) : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ flex: 1, height: 7, borderRadius: 4 }}
        color={pct === 100 ? 'success' : 'primary'}
      />
      <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 44 }}>
        {counted}/{total}
      </Typography>
    </Box>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function StocktakeView() {
  const { appData, outlets } = useAuth();
  const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';
  const businessId = appData?.businessId;
  const assignedOutletId = appData?.outletId;

  const [selectedOutletId, setSelectedOutletId] = useState(
    isOwner ? (outlets[0]?.id || '') : (assignedOutletId || '')
  );

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(isOwner ? outlets[0].id : (assignedOutletId || outlets[0].id));
    }
  }, [outlets, selectedOutletId, isOwner, assignedOutletId]);

  // Sessions list
  const [sessions, setSessions] = useState<Stocktake[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Active session
  const [activeSession, setActiveSession] = useState<Stocktake | null>(null);
  const [sessionItems, setSessionItems] = useState<StocktakeItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  // ── Per-row count state (controlled inputs) ──
  // Maps item._id → string value typed by user
  const [localCounts, setLocalCounts] = useState<Record<string, string>>({});
  // Set of item._ids that have unsaved changes
  const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());
  // Set of item._ids currently being saved
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  // Set of item._ids recently saved (show tick for 2s)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Session action states
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [initiateNotes, setInitiateNotes] = useState('');
  const [initiating, setInitiating] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [confirmReconcile, setConfirmReconcile] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
  const showSnack = (msg: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, msg, severity });

  // ── Initialize local counts when items load ──
  const initLocalCounts = useCallback((items: StocktakeItem[]) => {
    const map: Record<string, string> = {};
    items.forEach((item) => {
      map[item._id] = item.countedQty !== undefined && item.countedQty !== null
        ? String(item.countedQty)
        : '';
    });
    setLocalCounts(map);
    setDirtyItems(new Set());
    setSavingItems(new Set());
    setSavedItems(new Set());
  }, []);

  // ── Data loaders ──
  const loadSessions = useCallback(async () => {
    if (!businessId) return;
    setLoadingSessions(true);
    try {
      const res = await api.listStocktakes({ businessId, outletId: selectedOutletId || undefined });
      setSessions((res as any)?.data ?? res ?? []);
    } catch (e: any) {
      showSnack(e.message || 'Failed to load sessions', 'error');
    } finally {
      setLoadingSessions(false);
    }
  }, [businessId, selectedOutletId]);

  const loadSessionItems = useCallback(async (sessionId: string) => {
    if (!businessId) return;
    setLoadingItems(true);
    try {
      const res = await api.getStocktake(sessionId, businessId);
      const sess = res?.stocktake ?? res;
      const items: StocktakeItem[] = res?.items ?? [];
      setActiveSession(sess);
      setSessionItems(items);
      initLocalCounts(items);
    } catch (e: any) {
      showSnack(e.message || 'Failed to load session', 'error');
    } finally {
      setLoadingItems(false);
    }
  }, [businessId, initLocalCounts]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // ── Handlers ──

  const handleInitiate = async () => {
    if (!businessId || !selectedOutletId) return;
    setInitiating(true);
    try {
      const res = await api.initiateStocktake({ businessId, outletId: selectedOutletId, notes: initiateNotes });
      showSnack('Stocktake session started — count sheet is ready');
      setInitiateOpen(false);
      setInitiateNotes('');
      await loadSessions();
      const sess = res?.stocktake ?? res;
      if (sess?._id) await loadSessionItems(sess._id);
    } catch (e: any) {
      showSnack(e.message || 'Failed to start session', 'error');
    } finally {
      setInitiating(false);
    }
  };

  const handleOpenSession = async (s: Stocktake) => {
    await loadSessionItems(s._id);
    // Scroll to active session panel
    setTimeout(() => document.getElementById('active-session')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // Save a single item's count
  const saveItemCount = useCallback(async (item: StocktakeItem, val: string): Promise<boolean> => {
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty < 0) return false;
    if (!activeSession || !businessId) return false;

    const productId = extractProductId(item.productId);
    if (!productId) {
      showSnack('Product ID missing for this item', 'error');
      return false;
    }

    const itemId = item._id;
    setSavingItems((prev) => new Set(prev).add(itemId));
    setDirtyItems((prev) => { const n = new Set(prev); n.delete(itemId); return n; });

    try {
      await api.updateStocktakeItem(
        activeSession._id,
        { productId, countedQty: qty },
        businessId
      );

      // Update local items state optimistically
      setSessionItems((prev) =>
        prev.map((i) =>
          i._id === itemId
            ? {
                ...i,
                countedQty: qty,
                variance: qty - i.expectedQty,
                varianceValue: (qty - i.expectedQty) * i.unitCost,
              }
            : i
        )
      );

      // Show saved tick for 2 seconds
      setSavedItems((prev) => new Set(prev).add(itemId));
      clearTimeout(savedTimers.current[itemId]);
      savedTimers.current[itemId] = setTimeout(() => {
        setSavedItems((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
      }, 2000);

      // Refresh session summary counters
      const res = await api.getStocktake(activeSession._id, businessId);
      setActiveSession(res?.stocktake ?? res);
      return true;
    } catch (e: any) {
      showSnack(`Failed to save ${extractProductName(item)}: ${e.message}`, 'error');
      setDirtyItems((prev) => new Set(prev).add(itemId)); // re-mark dirty on error
      return false;
    } finally {
      setSavingItems((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
    }
  }, [activeSession, businessId]);

  const handleCountInput = (itemId: string, val: string) => {
    setLocalCounts((prev) => ({ ...prev, [itemId]: val }));
    setDirtyItems((prev) => new Set(prev).add(itemId));
    setSavedItems((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
  };

  const handleSaveItem = (item: StocktakeItem) => {
    saveItemCount(item, localCounts[item._id] ?? '');
  };

  const handleSaveAll = async () => {
    if (!activeSession) return;
    const dirtyList = sessionItems.filter((i) => dirtyItems.has(i._id));
    if (dirtyList.length === 0) {
      showSnack('No unsaved changes');
      return;
    }
    setSaveAllLoading(true);
    let saved = 0;
    for (const item of dirtyList) {
      const ok = await saveItemCount(item, localCounts[item._id] ?? '');
      if (ok) saved++;
    }
    setSaveAllLoading(false);
    showSnack(`Saved ${saved}/${dirtyList.length} items`);
  };

  const handleSubmit = async () => {
    if (!activeSession || !businessId) return;

    // Warn if unsaved changes
    if (dirtyItems.size > 0) {
      showSnack(`You have ${dirtyItems.size} unsaved count(s). Save them first.`, 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      const updated = await api.submitStocktake(activeSession._id, businessId);
      setActiveSession(updated?.stocktake ?? updated);
      showSnack('Count submitted — ready for reconciliation');
      await loadSessions();
    } catch (e: any) {
      showSnack(e.message || 'Submit failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReconcile = async () => {
    if (!activeSession || !businessId) return;
    setConfirmReconcile(false);
    setReconcileLoading(true);
    try {
      await api.reconcileStocktake(activeSession._id, businessId);
      showSnack('Reconciliation applied — stock quantities updated');
      setActiveSession(null);
      setSessionItems([]);
      initLocalCounts([]);
      await loadSessions();
    } catch (e: any) {
      showSnack(e.message || 'Reconciliation failed', 'error');
    } finally {
      setReconcileLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeSession || !businessId) return;
    setCancelLoading(true);
    try {
      await api.cancelStocktake(activeSession._id, businessId);
      showSnack('Stocktake session cancelled');
      setActiveSession(null);
      setSessionItems([]);
      initLocalCounts([]);
      await loadSessions();
    } catch (e: any) {
      showSnack(e.message || 'Cancel failed', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Derived values ──

  const filteredItems = sessionItems.filter((i) => {
    if (!searchItem) return true;
    const q = searchItem.toLowerCase();
    return (
      extractProductName(i).toLowerCase().includes(q) ||
      extractProductSku(i).toLowerCase().includes(q)
    );
  });

  const canEdit = activeSession?.status === 'IN_PROGRESS';
  const allCounted = (activeSession?.countedItems ?? 0) === (activeSession?.totalItems ?? 0) && (activeSession?.totalItems ?? 0) > 0;
  const canSubmit = canEdit && allCounted && dirtyItems.size === 0;
  const canReconcile = activeSession?.status === 'SUBMITTED' && isOwner;

  // ── Render ──

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Breadcrumbs links={[{ name: 'Dashboard', href: '/app' }, { name: 'Stocktake' }]} />
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isOwner && outlets.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Outlet</InputLabel>
              <Select
                value={selectedOutletId}
                label="Filter by Outlet"
                onChange={(e) => {
                  setSelectedOutletId(e.target.value);
                  setActiveSession(null);
                  setSessionItems([]);
                  initLocalCounts([]);
                }}
              >
                {outlets.map((o) => (
                  <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setInitiateOpen(true)}
          >
            New Stocktake
          </Button>
        </Stack>
      </Stack>

      {/* ── Active session panel ── */}
      {loadingItems && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {activeSession && !loadingItems && (
        <Card id="active-session" variant="outlined" sx={{ mb: 3, borderColor: 'primary.main', borderWidth: 2 }}>
          {/* Session header */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Typography variant="h6">Stocktake Session</Typography>
                  <Label color={STATUS_COLOR[activeSession.status] ?? 'default'}>
                    {activeSession.status}
                  </Label>
                  {dirtyItems.size > 0 && (
                    <Chip label={`${dirtyItems.size} unsaved`} size="small" color="warning" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Started: {fDateTime(activeSession.snapshotAt || activeSession.createdAt)}
                </Typography>
                {activeSession.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    Note: {activeSession.notes}
                  </Typography>
                )}
              </Box>

              {/* Summary stats */}
              <Grid container spacing={1.5} sx={{ maxWidth: 420 }}>
                {[
                  { label: 'Total Items', value: activeSession.totalItems, color: 'text.primary' },
                  { label: 'Counted', value: activeSession.countedItems, color: allCounted ? 'success.main' : 'primary.main' },
                  { label: 'Variances', value: activeSession.varianceCount, color: activeSession.varianceCount > 0 ? 'warning.main' : 'text.primary' },
                  { label: 'Value Impact', value: fCurrency(activeSession.totalVarianceValue), color: activeSession.totalVarianceValue < 0 ? 'error.main' : 'success.main' },
                ].map(({ label, value, color }) => (
                  <Grid size={{ xs: 6 }} key={label}>
                    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700} color={color}>{value}</Typography>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>

            {/* Progress bar */}
            <Box sx={{ mt: 2 }}>
              <ProgressBar counted={activeSession.countedItems} total={activeSession.totalItems} />
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
              {canEdit && dirtyItems.size > 0 && (
                <LoadingButton
                  variant="contained"
                  color="primary"
                  loading={saveAllLoading}
                  onClick={handleSaveAll}
                  startIcon={<Iconify icon="eva:checkmark-fill" />}
                >
                  Save {dirtyItems.size} Change{dirtyItems.size !== 1 ? 's' : ''}
                </LoadingButton>
              )}

              {canEdit && (
                <Tooltip title={!allCounted ? 'Count all items before submitting' : dirtyItems.size > 0 ? 'Save unsaved changes first' : ''}>
                  <span>
                    <LoadingButton
                      variant={canSubmit ? 'contained' : 'outlined'}
                      loading={submitLoading}
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      color="success"
                      startIcon={<Iconify icon="solar:check-circle-bold" />}
                    >
                      Submit Count ({activeSession.countedItems}/{activeSession.totalItems})
                    </LoadingButton>
                  </span>
                </Tooltip>
              )}

              {canReconcile && (
                <LoadingButton
                  variant="contained"
                  color="warning"
                  loading={reconcileLoading}
                  onClick={() => setConfirmReconcile(true)}
                  startIcon={<Iconify icon="solar:restart-bold" />}
                >
                  Apply Reconciliation
                </LoadingButton>
              )}

              <LoadingButton
                variant="outlined"
                color="error"
                loading={cancelLoading}
                onClick={handleCancel}
                disabled={activeSession.status === 'COMPLETED'}
                startIcon={<Iconify icon="eva:close-fill" />}
              >
                Cancel Session
              </LoadingButton>

              <Button
                variant="text"
                color="inherit"
                onClick={() => { setActiveSession(null); setSessionItems([]); initLocalCounts([]); }}
              >
                Hide
              </Button>
            </Stack>
          </Box>

          {/* Count sheet */}
          <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Count Sheet
                {canEdit && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    — enter physical qty counted, then click ✓ to save each row
                  </Typography>
                )}
              </Typography>
              <TextField
                size="small"
                placeholder="Search by name or SKU..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                sx={{ width: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 18, height: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {filteredItems.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {searchItem ? 'No products match your search.' : 'No items in this count sheet.'}
              </Typography>
            )}

            {filteredItems.length > 0 && (
              <Scrollbar sx={{ maxHeight: 440 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 220 }}>Product</TableCell>
                      <TableCell align="center" sx={{ width: 90 }}>Expected</TableCell>
                      <TableCell align="center" sx={{ width: 160 }}>
                        Physical Count
                        {canEdit && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>(enter qty)</Typography>}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>Variance</TableCell>
                      <TableCell align="right" sx={{ width: 110 }}>Value Impact</TableCell>
                      {canEdit && <TableCell align="center" sx={{ width: 70 }}>Save</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const name = extractProductName(item);
                      const sku = extractProductSku(item);
                      const localVal = localCounts[item._id] ?? '';
                      const isDirty = dirtyItems.has(item._id);
                      const isSaving = savingItems.has(item._id);
                      const isSaved = savedItems.has(item._id);

                      // Variance from local value if dirty, otherwise from server
                      const displayQty = localVal !== '' ? parseInt(localVal, 10) : item.countedQty;
                      const variance = displayQty !== undefined && !isNaN(displayQty as number)
                        ? (displayQty as number) - item.expectedQty
                        : undefined;
                      const varianceValue = variance !== undefined ? variance * item.unitCost : undefined;

                      const rowBg = isSaved
                        ? 'success.lighter'
                        : isDirty
                        ? 'warning.lighter'
                        : undefined;

                      return (
                        <TableRow
                          key={item._id}
                          hover={!isDirty && !isSaved}
                          sx={{ bgcolor: rowBg, transition: 'background-color 0.3s' }}
                        >
                          {/* Product name + SKU */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{name}</Typography>
                            {sku && (
                              <Typography variant="caption" color="text.secondary">SKU: {sku}</Typography>
                            )}
                          </TableCell>

                          {/* Expected (snapshot) */}
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {item.expectedQty}
                            </Typography>
                          </TableCell>

                          {/* Count input (controlled) */}
                          <TableCell align="center">
                            {canEdit ? (
                              <TextField
                                size="small"
                                type="number"
                                value={localVal}
                                onChange={(e) => handleCountInput(item._id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveItem(item);
                                }}
                                placeholder="0"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: 'center', width: 64, fontWeight: 700 },
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderColor: isDirty ? 'warning.main' : isSaved ? 'success.main' : undefined,
                                  },
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color={item.countedQty !== undefined ? 'text.primary' : 'text.disabled'}
                              >
                                {item.countedQty !== undefined && item.countedQty !== null
                                  ? item.countedQty
                                  : '—'}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Variance */}
                          <TableCell align="center">
                            {variance !== undefined ? (
                              <Label
                                color={variance === 0 ? 'default' : variance > 0 ? 'success' : 'error'}
                                variant={variance === 0 ? 'soft' : 'filled'}
                              >
                                {variance > 0 ? '+' : ''}{variance}
                              </Label>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>

                          {/* Value impact */}
                          <TableCell align="right">
                            {varianceValue !== undefined && varianceValue !== 0 ? (
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={varianceValue > 0 ? 'success.main' : 'error.main'}
                              >
                                {varianceValue > 0 ? '+' : ''}{fCurrency(varianceValue)}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </TableCell>

                          {/* Save button */}
                          {canEdit && (
                            <TableCell align="center">
                              {isSaving ? (
                                <CircularProgress size={18} />
                              ) : isSaved ? (
                                <Iconify
                                  icon="eva:checkmark-circle-2-fill"
                                  sx={{ color: 'success.main', width: 22, height: 22 }}
                                />
                              ) : (
                                <Tooltip title={isDirty ? 'Save this count (Enter)' : 'No changes'}>
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      disabled={!isDirty || localVal === ''}
                                      onClick={() => handleSaveItem(item)}
                                    >
                                      <Iconify icon="eva:checkmark-fill" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Scrollbar>
            )}

            {/* Sticky footer legend */}
            {canEdit && (
              <Stack direction="row" spacing={2} sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">Unsaved changes</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">Saved</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Tip: Press Enter to save a row, or use the ✓ button.
                </Typography>
              </Stack>
            )}
          </Box>
        </Card>
      )}

      {/* ── Sessions history table ── */}
      <Card>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700}>Session History</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Started</TableCell>
                <TableCell>Outlet</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Progress</TableCell>
                <TableCell align="right">Variances</TableCell>
                <TableCell align="right">Value Impact</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingSessions && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loadingSessions && sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No stocktake sessions yet.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click &quot;New Stocktake&quot; to start counting your inventory.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {sessions.map((s) => {
                const outletName = (s.outletId as any)?.name ?? 'Unknown outlet';
                const isActive = activeSession?._id === s._id;
                return (
                  <TableRow key={s._id} hover selected={isActive}>
                    <TableCell>
                      <Typography variant="body2">{fDateTime(s.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{outletName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Label color={STATUS_COLOR[s.status] ?? 'default'}>{s.status}</Label>
                    </TableCell>
                    <TableCell>
                      <ProgressBar counted={s.countedItems} total={s.totalItems} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={s.varianceCount > 0 ? 'warning.main' : 'text.secondary'}>
                        {s.varianceCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={s.totalVarianceValue < 0 ? 'error.main' : s.totalVarianceValue > 0 ? 'success.main' : 'text.secondary'}>
                        {s.totalVarianceValue !== 0 ? fCurrency(s.totalVarianceValue) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {s.status === 'CANCELLED' ? (
                        <Typography variant="caption" color="text.disabled">Cancelled</Typography>
                      ) : isActive ? (
                        <Button size="small" variant="outlined" color="primary" disabled>
                          Open
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant={s.status === 'COMPLETED' ? 'text' : 'outlined'}
                          onClick={() => handleOpenSession(s)}
                        >
                          {s.status === 'COMPLETED' ? 'View' : 'Open'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Initiate dialog ── */}
      <Dialog open={initiateOpen} onClose={() => setInitiateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Start New Stocktake</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {isOwner && (
              <FormControl size="small" fullWidth>
                <InputLabel>Outlet to Count</InputLabel>
                <Select
                  value={selectedOutletId}
                  label="Outlet to Count"
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                >
                  {outlets.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Notes (optional)"
              multiline
              rows={2}
              size="small"
              fullWidth
              value={initiateNotes}
              onChange={(e) => setInitiateNotes(e.target.value)}
              placeholder="e.g. Monthly end-of-month physical count"
            />
            <Alert severity="info" sx={{ fontSize: '12px' }}>
              <strong>What happens:</strong> The system snapshots current stock quantities for all products in this outlet.
              You then physically count each item and enter what you see. Discrepancies are reconciled at the end.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInitiateOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={initiating}
            onClick={handleInitiate}
            disabled={!selectedOutletId}
          >
            Start Count
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* ── Reconcile confirm dialog ── */}
      <Dialog open={confirmReconcile} onClose={() => setConfirmReconcile(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply Reconciliation?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            This will adjust stock quantities to match your physical count for <strong>{activeSession?.varianceCount} product(s)</strong>.
            The total value impact is <strong>{fCurrency(activeSession?.totalVarianceValue ?? 0)}</strong>.
            <br /><br />
            All adjustments are recorded as STOCKTAKE movements in the audit trail. This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReconcile(false)}>Go Back</Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={reconcileLoading}
            onClick={handleReconcile}
          >
            Confirm & Apply
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
