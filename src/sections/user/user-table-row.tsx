import type { Employee } from 'src/types';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import {
  Modal,
  Button,
  Select,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  MenuItem as MuiMenuItem,
} from '@mui/material';

import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { useAppSnackbar } from 'src/contexts/snackbar-context';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: Employee;
  selected: boolean;
  onSelectRow: () => void;
  onRefresh: () => void;
};

function roleLabel(role?: string) {
  if (role === 'owner') return 'Owner';
  if (role === 'outlet_admin' || role === 'store_executive') return 'Outlet Admin';
  if (role === 'sales_rep') return 'Sales Representative';
  if (role === 'system_admin') return 'System Admin';
  return role || '—';
}

export function UserTableRow({ row, selected, onSelectRow, onRefresh }: UserTableRowProps) {
  const { appData } = useAuth();
  const { showSuccess, showError } = useAppSnackbar();
  const isOwner = appData?.role === 'owner' || appData?.role === 'system_admin';
  const isOutletAdmin = !isOwner && (appData?.role === 'outlet_admin' || appData?.role === 'store_executive');

  const currentRole =
    (row as any).role ||
    row.userId?.role ||
    'sales_rep';

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [savingHR, setSavingHR] = useState(false);
  const [payingSalary, setPayingSalary] = useState(false);

  const [editData, setEditData] = useState({
    salary: row.salary,
    position: row.position,
    role: currentRole === 'store_executive' ? 'outlet_admin' : currentRole,
    status: row.userId?.status || 'active',
  });

  const [payData, setPayData] = useState({
    amount: row.salary,
    paymentMethod: 'bank_transfer',
    notes: '',
  });
  const [salaryStatus, setSalaryStatus] = useState<{
    salaryCap: number;
    paidSoFar: number;
    remaining: number;
    monthLocked: boolean;
    month: number;
    year: number;
  } | null>(null);
  const [loadingSalaryStatus, setLoadingSalaryStatus] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const openEdit = () => {
    setEditData({
      salary: row.salary,
      position: row.position,
      role: currentRole === 'store_executive' ? 'outlet_admin' : String(currentRole),
      status: row.userId?.status || 'active',
    });
    setOpenEditModal(true);
    handleClosePopover();
  };

  const handleUpdateStatus = useCallback(
    async (status: string) => {
      try {
        await api.updateEmployeeStatus({
          userId: row.userId._id,
          status,
          isActive: status === 'active',
        });
        showSuccess(status === 'suspended' ? 'Employee suspended.' : 'Employee activated.');
        onRefresh();
        handleClosePopover();
      } catch (error) {
        showError(formatError(error));
      }
    },
    [row.userId._id, onRefresh, handleClosePopover, showError, showSuccess]
  );

  const handleDelete = useCallback(async () => {
    if (!isOwner) return;
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.deleteEmployee(row._id);
        onRefresh();
        handleClosePopover();
      } catch (error) {
        showError(formatError(error));
      }
    }
  }, [row._id, onRefresh, handleClosePopover, showError, isOwner]);

  const handleEditHR = useCallback(async () => {
    setSavingHR(true);
    try {
      const payload: {
        salary: number;
        position: string;
        role?: string;
      } = {
        salary: Number(editData.salary),
        position: editData.position,
      };

      if (isOwner && (editData.role === 'sales_rep' || editData.role === 'outlet_admin')) {
        payload.role = editData.role;
      }

      await api.updateEmployee(row._id, payload);

      if (isOwner && editData.status !== row.userId?.status) {
        await api.updateEmployeeStatus({
          userId: row.userId._id,
          status: editData.status,
          isActive: editData.status === 'active',
        });
      }

      setOpenEditModal(false);
      showSuccess('Employee updated.');
      onRefresh();
    } catch (error) {
      showError(formatError(error));
    } finally {
      setSavingHR(false);
    }
  }, [row._id, row.userId, editData, onRefresh, isOwner, showError, showSuccess]);

  useEffect(() => {
    if (!openPayModal) return undefined;
    let cancelled = false;
    setLoadingSalaryStatus(true);
    api
      .getEmployeeSalaryStatus(row._id)
      .then((status) => {
        if (cancelled) return;
        setSalaryStatus({
          salaryCap: status.salaryCap,
          paidSoFar: status.paidSoFar,
          remaining: status.remaining,
          monthLocked: status.monthLocked,
          month: status.month,
          year: status.year,
        });
        setPayData((prev) => ({
          ...prev,
          amount: status.monthLocked ? 0 : status.remaining || prev.amount,
        }));
      })
      .catch((error) => {
        if (!cancelled) showError(formatError(error));
      })
      .finally(() => {
        if (!cancelled) setLoadingSalaryStatus(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openPayModal, row._id, showError]);

  const handlePaySalary = useCallback(async () => {
    if (!isOwner && !isOutletAdmin) return;
    if (salaryStatus?.monthLocked) {
      showError('Salary for this month is fully paid — further payments are locked.');
      return;
    }
    if (salaryStatus && payData.amount > salaryStatus.remaining) {
      showError(
        `Amount exceeds remaining salary this month (₦${salaryStatus.remaining.toLocaleString()} left).`
      );
      return;
    }
    setPayingSalary(true);
    try {
      const result = await api.paySalary({
        employeeId: row._id,
        ...payData,
      });
      setOpenPayModal(false);
      const lockedNote = result?.monthLocked ? ' Month is now locked.' : '';
      showSuccess(`Salary payment recorded.${lockedNote}`);
    } catch (error) {
      showError(formatError(error));
    } finally {
      setPayingSalary(false);
    }
  }, [row._id, payData, isOwner, isOutletAdmin, salaryStatus, showError, showSuccess]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              textTransform: 'capitalize',
            }}
          >
            <Avatar alt={row.userId.fullName} src="" />
            {row.userId.fullName}
          </Box>
        </TableCell>

        <TableCell>{row.position}</TableCell>

        <TableCell>{roleLabel(currentRole)}</TableCell>

        <TableCell>{row.salary.toLocaleString()}</TableCell>

        <TableCell>
          <Label
            color={
              (row.userId.status === 'suspended' && 'error') ||
              (row.userId.status === 'pending' && 'warning') ||
              'success'
            }
          >
            {row.userId.status || 'active'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={openEdit}>
            <Iconify icon="solar:pen-bold" />
            {isOutletAdmin ? 'Edit employee' : 'Edit'}
          </MenuItem>

          {(isOwner || isOutletAdmin) && (
            <MenuItem
              onClick={() => {
                setOpenPayModal(true);
                handleClosePopover();
              }}
            >
              <Iconify icon="solar:cart-3-bold" />
              Pay Salary
            </MenuItem>
          )}

          {isOwner && row.userId.status !== 'active' && (
            <MenuItem onClick={() => handleUpdateStatus('active')}>
              <Iconify icon="solar:check-circle-bold" />
              Activate
            </MenuItem>
          )}

          {isOwner && row.userId.status !== 'suspended' && (
            <MenuItem onClick={() => handleUpdateStatus('suspended')}>
              <Iconify icon="solar:minus-circle-bold" />
              Suspend
            </MenuItem>
          )}

          {isOwner && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 440,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Typography variant="h6">
            {isOutletAdmin ? 'Edit outlet employee' : 'Edit employee'}
          </Typography>

          <TextField
            fullWidth
            label="Position"
            value={editData.position}
            onChange={(e) => setEditData({ ...editData, position: e.target.value })}
          />

          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={editData.salary}
            onChange={(e) => setEditData({ ...editData, salary: Number(e.target.value) })}
          />

          {isOwner && (
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editData.role}
                label="Role"
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              >
                <MuiMenuItem value="sales_rep">Sales Representative</MuiMenuItem>
                <MuiMenuItem value="outlet_admin">Outlet Admin</MuiMenuItem>
              </Select>
            </FormControl>
          )}

          {isOwner && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                label="Status"
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <MuiMenuItem value="active">Active</MuiMenuItem>
                <MuiMenuItem value="suspended">Suspended</MuiMenuItem>
                <MuiMenuItem value="pending">Pending</MuiMenuItem>
              </Select>
            </FormControl>
          )}

          {isOutletAdmin && (
            <Typography variant="caption" color="text.secondary">
              You can update salary and position for staff in your outlet. Suspend/activate and role
              changes require the business owner.
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button onClick={() => setOpenEditModal(false)} disabled={savingHR}>
              Cancel
            </Button>
            <LoadingButton variant="contained" loading={savingHR} onClick={handleEditHR}>
              Save
            </LoadingButton>
          </Box>
        </Box>
      </Modal>

      {isOwner && (
        <Modal open={openPayModal} onClose={() => setOpenPayModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Typography variant="h6">Pay Salary</Typography>
            {loadingSalaryStatus ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : salaryStatus ? (
              <Alert severity={salaryStatus.monthLocked ? 'warning' : 'info'}>
                {salaryStatus.month}/{salaryStatus.year}: paid ₦
                {salaryStatus.paidSoFar.toLocaleString()} of ₦
                {salaryStatus.salaryCap.toLocaleString()}
                {salaryStatus.monthLocked
                  ? ' — month locked (no further payments).'
                  : ` — ₦${salaryStatus.remaining.toLocaleString()} remaining.`}
              </Alert>
            ) : null}
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={payData.amount}
              disabled={Boolean(salaryStatus?.monthLocked)}
              onChange={(e) => setPayData({ ...payData, amount: Number(e.target.value) })}
              helperText={
                salaryStatus && !salaryStatus.monthLocked
                  ? `Max this month: ₦${salaryStatus.remaining.toLocaleString()}`
                  : undefined
              }
              inputProps={{
                min: 0.01,
                max: salaryStatus?.remaining ?? undefined,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={payData.paymentMethod}
                label="Payment Method"
                disabled={Boolean(salaryStatus?.monthLocked)}
                onChange={(e) => setPayData({ ...payData, paymentMethod: e.target.value })}
              >
                <MuiMenuItem value="bank_transfer">Bank Transfer</MuiMenuItem>
                <MuiMenuItem value="cash">Cash</MuiMenuItem>
                <MuiMenuItem value="mobile_money">Mobile Money</MuiMenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={payData.notes}
              disabled={Boolean(salaryStatus?.monthLocked)}
              onChange={(e) => setPayData({ ...payData, notes: e.target.value })}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setOpenPayModal(false)} disabled={payingSalary}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                loading={payingSalary}
                disabled={Boolean(salaryStatus?.monthLocked) || loadingSalaryStatus}
                onClick={handlePaySalary}
              >
                Confirm Payment
              </LoadingButton>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}
