import type { Employee } from 'src/types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
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

      if (editData.status !== row.userId?.status) {
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

  const handlePaySalary = useCallback(async () => {
    if (!isOwner) return;
    setPayingSalary(true);
    try {
      await api.paySalary({
        employeeId: row._id,
        ...payData,
      });
      setOpenPayModal(false);
      showSuccess('Salary payment recorded successfully.');
    } catch (error) {
      showError(formatError(error));
    } finally {
      setPayingSalary(false);
    }
  }, [row._id, payData, isOwner, showError, showSuccess]);

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

          {isOwner && (
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

          {row.userId.status !== 'active' && (
            <MenuItem onClick={() => handleUpdateStatus('active')}>
              <Iconify icon="solar:check-circle-bold" />
              Activate
            </MenuItem>
          )}

          {row.userId.status !== 'suspended' && (
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

          {isOutletAdmin && (
            <Typography variant="caption" color="text.secondary">
              You can update salary, position, and status for staff in your outlet only. Role changes
              require the business owner.
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
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={payData.amount}
              onChange={(e) => setPayData({ ...payData, amount: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={payData.paymentMethod}
                label="Payment Method"
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
