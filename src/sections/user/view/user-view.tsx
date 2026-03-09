import type { Employee, EmployeePagination } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Modal, Select, TextField, InputLabel, FormControl, MenuItem as MuiMenuItem } from '@mui/material';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

export function UserView() {
  const table = useTable();
  const { outlets } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<EmployeePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterName, setFilterName] = useState('');

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'sales_rep',
    salary: 0,
    position: '',
    outletId: '',
  });

  // Set default outletId when outlets are loaded
  useEffect(() => {
    if (outlets.length > 0 && !newEmployee.outletId) {
      setNewEmployee((prev) => ({ ...prev, outletId: outlets[0]._id }));
    }
  }, [outlets, newEmployee.outletId]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getEmployees({
        page: table.page + 1,
        limit: table.rowsPerPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        outletId: selectedOutlet === 'all' ? undefined : selectedOutlet,
      });
      setEmployees(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, statusFilter, selectedOutlet]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreateEmployee = async () => {
    try {
      await api.createEmployee(newEmployee);
      setOpenCreateModal(false);
      fetchEmployees();
      setNewEmployee({
        fullName: '',
        email: '',
        phone: '',
        role: 'sales_rep',
        salary: 0,
        position: '',
        outletId: outlets[0]?._id || '',
      });
    } catch (error) {
      console.error('Failed to create employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to create employee');
    }
  };

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setStatusFilter(newValue);
      table.onResetPage();
    },
    [table]
  );

  const handleFilterOutlet = useCallback(
    (event: any) => {
      setSelectedOutlet(event.target.value);
      table.onResetPage();
    },
    [table]
  );

  const notFound = !loading && !employees.length;

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'User', href: '/user' },
          { name: 'List' },
        ]}
      />
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Employees
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenCreateModal(true)}
        >
          New employee
        </Button>
      </Box>

      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={handleFilterStatus}
            sx={{
              flexGrow: 1,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
            }}
          >
            {STATUS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Tabs>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={selectedOutlet}
              label="Outlet"
              onChange={handleFilterOutlet}
            >
              <MuiMenuItem value="all">All Outlets</MuiMenuItem>
              {outlets.map((outlet) => (
                <MuiMenuItem key={outlet._id} value={outlet._id}>
                  {outlet.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            // Local filtering for name if needed, or update API to support search
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={pagination?.total || 0}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    employees.map((user) => user._id)
                  )
                }
                headLabel={[
                  { id: 'fullName', label: 'Name' },
                  { id: 'position', label: 'Position' },
                  { id: 'role', label: 'Role' },
                  { id: 'salary', label: 'Salary' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {employees.map((row) => (
                  <UserTableRow
                    key={row._id}
                    row={row as any}
                    selected={table.selected.includes(row._id)}
                    onSelectRow={() => table.onSelectRow(row._id)}
                    onRefresh={fetchEmployees}
                  />
                ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, pagination?.total || 0)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={pagination?.total || 0}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Create Employee Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6">Create New Employee</Typography>

          <TextField
            fullWidth
            label="Full Name"
            value={newEmployee.fullName}
            onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
          />

          <TextField
            fullWidth
            label="Phone"
            value={newEmployee.phone}
            onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newEmployee.role}
              label="Role"
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
            >
              <MuiMenuItem value="sales_rep">Sales Representative</MuiMenuItem>
              <MuiMenuItem value="store_manager">Store Manager</MuiMenuItem>
              <MuiMenuItem value="admin">Admin</MuiMenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Position"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
          />

          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
          />

          <FormControl fullWidth>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={newEmployee.outletId}
              label="Outlet"
              onChange={(e) => setNewEmployee({ ...newEmployee, outletId: e.target.value })}
            >
              {outlets.map((outlet) => (
                <MuiMenuItem key={outlet._id} value={outlet._id}>
                  {outlet.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateEmployee} color="primary">Create</Button>
          </Box>
        </Box>
      </Modal>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
