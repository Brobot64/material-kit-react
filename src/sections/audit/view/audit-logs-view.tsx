import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { fDateTime } from 'src/utils/format-time';
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { useSocket } from 'src/contexts/socket-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

type AuditDiff = { field: string; oldValue: any; newValue: any };

type AuditLog = {
    _id: string;
    action: string;
    actionBy?: { userId?: string; name?: string; role?: string };
    performedTo?: string;
    description?: string;
    businessId?: string;
    outletId?: string;
    diff?: AuditDiff[];
    metadata?: any;
    createdAt?: string;
};

type LabelColor = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

function getActionColor(action: string): LabelColor {
    const a = (action || '').toUpperCase();
    if (
        a.includes('DELETE') ||
        a.includes('VOID') ||
        a.includes('CANCEL') ||
        a.includes('BELOW_COST') ||
        a.includes('BELOW_FLOOR') ||
        a.includes('REFUND') ||
        a.includes('FAIL')
    ) {
        return 'error';
    }
    if (a.includes('CREATE') || a.includes('ADD')) return 'success';
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('ADJUST') || a.includes('TRANSFER')) {
        return 'warning';
    }
    if (a.includes('LOGIN') || a.includes('PAYMENT') || a.includes('PAID') || a.includes('VIEW')) {
        return 'info';
    }
    return 'default';
}

function formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

const COLUMN_COUNT = 7;

// ----------------------------------------------------------------------

export function AuditLogsView() {
    const { outlets, appData } = useAuth();
    const { socket, isConnected } = useSocket();
    const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';
    const assignedOutletId = appData?.outletId;

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOutletId, setSelectedOutletId] = useState(isOwner ? '' : assignedOutletId || '');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Server-side filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    // Client-side filter
    const [keyword, setKeyword] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Trace (detail) dialog
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const outletNameById = useMemo(() => {
        const map = new Map<string, string>();
        (outlets || []).forEach((o: any) => map.set(o.id, o.name));
        return map;
    }, [outlets]);

    const resolveOutletName = useCallback(
        (id?: string) => {
            if (!id) return '—';
            return outletNameById.get(id) || `${String(id).slice(-6).toUpperCase()}`;
        },
        [outletNameById]
    );

    // Reset to first page when server-side filters change
    useEffect(() => {
        setPage(0);
    }, [selectedOutletId, startDate, endDate, actionFilter, targetFilter, userFilter]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getAuditLogs({
                outletId: selectedOutletId || undefined,
                action: actionFilter || undefined,
                performedTo: targetFilter || undefined,
                userId: userFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate ? `${endDate}T23:59:59` : undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setLogs(response.data || []);
            setTotalElements(response.pagination?.total ?? response.pagination?.totalElements ?? 0);
        } catch (error: any) {
            setSnackbar({ open: true, message: formatError(error) || 'Failed to fetch audit logs', severity: 'error' });
            setLogs([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [selectedOutletId, actionFilter, targetFilter, userFilter, startDate, endDate, page, rowsPerPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Real-time: prepend new audit entries pushed over the socket. The backend scopes the
    // event by room (outlet room for outlet-bound entries, owners room for business-level),
    // so an outlet admin only ever receives their own outlet's entries.
    useEffect(() => {
        if (!socket) return undefined;
        const handler = (entry: AuditLog) => {
            // Respect the active filters so a live row matches what's currently on screen
            if (selectedOutletId && entry.outletId && entry.outletId !== selectedOutletId) return;
            if (actionFilter && entry.action !== actionFilter) return;
            if (targetFilter && entry.performedTo !== targetFilter) return;
            if (userFilter && entry.actionBy?.userId !== userFilter) return;
            if (entry.createdAt) {
                const ts = new Date(entry.createdAt).getTime();
                if (startDate && ts < new Date(startDate).getTime()) return;
                if (endDate && ts > new Date(`${endDate}T23:59:59`).getTime()) return;
            }

            setTotalElements((t) => t + 1);
            // Only live-prepend on the first page (the newest-first view)
            if (page !== 0) return;
            setLogs((prev) => {
                if (entry._id && prev.some((l) => l._id === entry._id)) return prev;
                return [entry, ...prev].slice(0, rowsPerPage);
            });
        };
        socket.on('audit-log', handler);
        return () => {
            socket.off('audit-log', handler);
        };
    }, [socket, selectedOutletId, actionFilter, targetFilter, userFilter, startDate, endDate, page, rowsPerPage]);

    // Distinct actions present in the loaded page, to populate the action dropdown
    const actionOptions = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => l.action && set.add(l.action));
        return Array.from(set).sort();
    }, [logs]);

    // Client-side keyword filter over the loaded page
    const filteredLogs = useMemo(() => {
        if (!keyword) return logs;
        const q = keyword.toLowerCase();
        return logs.filter((l) =>
            [l.action, l.description, l.actionBy?.name, l.actionBy?.role, l.performedTo]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [logs, keyword]);

    const handleCopy = (value: string, label = 'Value') => {
        navigator.clipboard.writeText(value).then(() => {
            setSnackbar({ open: true, message: `${label} copied to clipboard`, severity: 'success' });
        });
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setActionFilter('');
        setTargetFilter('');
        setUserFilter('');
    };

    const activeFilterCount = [startDate, endDate, actionFilter, targetFilter, userFilter].filter(Boolean).length;

    let scopeLabel = `your outlet "${resolveOutletName(assignedOutletId)}"`;
    if (isOwner) {
        scopeLabel = selectedOutletId
            ? `outlet "${resolveOutletName(selectedOutletId)}"`
            : 'the whole business';
    }

    return (
        <DashboardContent>
            <Breadcrumbs
                links={[{ name: 'Dashboard', href: '/app' }, { name: 'Audit Trail' }]}
                sx={{ mb: 3 }}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Iconify icon="solar:shield-keyhole-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
                    <Typography variant="h4">Audit Trail</Typography>
                    <Label
                        variant="soft"
                        color={isConnected ? 'success' : 'default'}
                        startIcon={
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: isConnected ? 'success.main' : 'text.disabled',
                                }}
                            />
                        }
                    >
                        {isConnected ? 'Live' : 'Offline'}
                    </Label>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        select
                        size="small"
                        label="Outlet"
                        value={selectedOutletId}
                        onChange={(e) => setSelectedOutletId(e.target.value)}
                        sx={{ minWidth: 170 }}
                        disabled={!isOwner}
                    >
                        {isOwner && <MenuItem value="">All Outlets</MenuItem>}
                        {(outlets || []).map((o: any) => (
                            <MenuItem key={o.id} value={o.id}>
                                {o.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Tooltip title="Refresh">
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={fetchLogs}
                            startIcon={<Iconify icon="solar:restart-bold" />}
                        >
                            Refresh
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack>

            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                Showing activity for {scopeLabel}. Entries are immutable and ordered newest-first. Click the eye icon to
                trace exactly what changed.
            </Alert>

            {/* Search + Filter bar */}
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <TextField
                    size="small"
                    placeholder="Search action, user, description, target…"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        endAdornment: keyword ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setKeyword('')}>
                                    <Iconify icon="eva:close-fill" width={16} />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
                <Button
                    size="small"
                    variant={showFilters ? 'contained' : 'outlined'}
                    startIcon={<Iconify icon="ic:round-filter-list" />}
                    onClick={() => setShowFilters((v) => !v)}
                    endIcon={
                        activeFilterCount > 0 ? (
                            <Chip label={activeFilterCount} size="small" color="error" sx={{ height: 18, fontSize: 11 }} />
                        ) : null
                    }
                >
                    Filters
                </Button>
                {activeFilterCount > 0 && (
                    <Button size="small" color="inherit" onClick={handleClearFilters}>
                        Clear
                    </Button>
                )}
            </Stack>

            <Collapse in={showFilters}>
                <Card sx={{ p: 2, mb: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                        <TextField
                            size="small"
                            label="From date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            size="small"
                            label="To date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            select
                            size="small"
                            label="Action"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="">All actions</MenuItem>
                            {actionOptions.map((a) => (
                                <MenuItem key={a} value={a}>
                                    {a}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            label="Target ID"
                            placeholder="Entity ID acted upon"
                            value={targetFilter}
                            onChange={(e) => setTargetFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                        />
                        <TextField
                            size="small"
                            label="User ID"
                            placeholder="Actor user ID"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                        />
                    </Stack>
                </Card>
            </Collapse>

            <Card>
                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
                        <Table sx={{ minWidth: 980 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Date / Time</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Performed By</TableCell>
                                    <TableCell>Target</TableCell>
                                    <TableCell>Outlet</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Trace</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton animation="wave" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log._id} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(log.createdAt)}</TableCell>

                                            <TableCell>
                                                <Label variant="soft" color={getActionColor(log.action)}>
                                                    {log.action}
                                                </Label>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" noWrap>
                                                    {log.actionBy?.name || '—'}
                                                </Typography>
                                                {log.actionBy?.role && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {log.actionBy.role}
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {log.performedTo ? (
                                                    <Tooltip title="Click to copy target ID">
                                                        <Typography
                                                            variant="body2"
                                                            onClick={() => handleCopy(log.performedTo as string, 'Target ID')}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                fontFamily: 'monospace',
                                                                '&:hover': { color: 'primary.main' },
                                                            }}
                                                        >
                                                            {String(log.performedTo).slice(-8).toUpperCase()}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>

                                            <TableCell>{resolveOutletName(log.outletId)}</TableCell>

                                            <TableCell sx={{ maxWidth: 320 }}>
                                                <Tooltip title={log.description || ''} placement="top">
                                                    <Typography variant="body2" noWrap color="text.secondary">
                                                        {log.description || '—'}
                                                    </Typography>
                                                </Tooltip>
                                                {!!log.diff?.length && (
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={`${log.diff.length} change${log.diff.length > 1 ? 's' : ''}`}
                                                        sx={{ height: 18, fontSize: 11, mt: 0.5 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell align="right">
                                                <Tooltip title="Trace details">
                                                    <IconButton size="small" onClick={() => setSelectedLog(log)}>
                                                        <Iconify icon="solar:eye-bold" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 10 }}>
                                            <Iconify
                                                icon="solar:clock-circle-outline"
                                                width={48}
                                                sx={{ color: 'text.disabled', mb: 1 }}
                                            />
                                            <Typography variant="body1" color="text.secondary">
                                                {keyword || activeFilterCount > 0
                                                    ? 'No audit entries match your filters'
                                                    : 'No audit activity recorded yet'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Card>

            <TablePagination
                page={page}
                component="div"
                count={totalElements}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Trace (detail) dialog */}
            <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {selectedLog && (
                            <Label variant="soft" color={getActionColor(selectedLog.action)}>
                                {selectedLog.action}
                            </Label>
                        )}
                        <span>Audit Trace</span>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedLog && (
                        <Stack spacing={2}>
                            {[
                                { label: 'When', value: fDateTime(selectedLog.createdAt) },
                                { label: 'Performed By', value: selectedLog.actionBy?.name || '—' },
                                { label: 'Role', value: selectedLog.actionBy?.role || '—' },
                                { label: 'Outlet', value: resolveOutletName(selectedLog.outletId) },
                            ].map(({ label, value }) => (
                                <Stack key={label} direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{label}:</Typography>
                                    <Typography variant="body2">{value}</Typography>
                                </Stack>
                            ))}

                            {selectedLog.performedTo && (
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2">Target ID:</Typography>
                                    <Chip
                                        size="small"
                                        label={selectedLog.performedTo}
                                        icon={<Iconify icon="solar:copy-bold" width={14} />}
                                        onClick={() => handleCopy(selectedLog.performedTo as string, 'Target ID')}
                                        sx={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', maxWidth: 280 }}
                                    />
                                </Stack>
                            )}

                            {selectedLog.actionBy?.userId && (
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2">Actor ID:</Typography>
                                    <Chip
                                        size="small"
                                        label={selectedLog.actionBy.userId}
                                        icon={<Iconify icon="solar:copy-bold" width={14} />}
                                        onClick={() => handleCopy(selectedLog.actionBy?.userId as string, 'Actor ID')}
                                        sx={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', maxWidth: 280 }}
                                    />
                                </Stack>
                            )}

                            <Divider />

                            <Stack>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                    Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedLog.description || '—'}
                                </Typography>
                            </Stack>

                            {!!selectedLog.diff?.length && (
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Changes ({selectedLog.diff.length})</Typography>
                                    <Card variant="outlined" sx={{ overflowX: 'auto' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Field</TableCell>
                                                    <TableCell>Before</TableCell>
                                                    <TableCell>After</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedLog.diff.map((d, i) => (
                                                    <TableRow key={`${d.field}-${i}`}>
                                                        <TableCell sx={{ fontWeight: 600 }}>{d.field}</TableCell>
                                                        <TableCell sx={{ color: 'error.main', wordBreak: 'break-all' }}>
                                                            {formatValue(d.oldValue)}
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'success.main', wordBreak: 'break-all' }}>
                                                            {formatValue(d.newValue)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </Stack>
                            )}

                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2">Metadata</Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            m: 0,
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: 'background.neutral',
                                            fontSize: 12,
                                            fontFamily: 'monospace',
                                            overflow: 'auto',
                                            maxHeight: 240,
                                        }}
                                    >
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </Box>
                                </Stack>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedLog(null)} color="inherit">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
