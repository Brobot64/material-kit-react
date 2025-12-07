import { useState, useCallback } from 'react';

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

import { RouterLink } from 'src/routes/components';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All', count: 0 },
  { value: 'active', label: 'Active', count: 0 },
  { value: 'pending', label: 'Pending', count: 0 },
  { value: 'banned', label: 'Banned', count: 0 },
  { value: 'rejected', label: 'Rejected', count: 0 },
];

export function UserView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Update tab counts
  const statusCounts = _users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === 'all' ? _users.length : (statusCounts[tab.value] || 0),
  }));

  const dataFiltered: UserProps[] = applyFilter({
    inputData: _users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
  });

  const notFound = !dataFiltered.length && (!!filterName || statusFilter !== 'all');

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
          Users
        </Typography>
        <Button
          component={RouterLink}
          href="/user/create"
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New user
        </Button>
      </Box>

      <Card>
        <Tabs
          value={statusFilter}
          onChange={(event, newValue) => {
            setStatusFilter(newValue);
            table.onResetPage();
          }}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
          }}
        >
          {tabsWithCounts.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {tab.label}
                  <Box
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.75,
                      fontSize: 12,
                      fontWeight: 'fontWeightBold',
                      bgcolor: tab.value === statusFilter ? 'primary.main' : 'grey.300',
                      color: tab.value === statusFilter ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    {tab.count}
                  </Box>
                </Box>
              }
              sx={{
                textTransform: 'capitalize',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </Tabs>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={_users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    _users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'company', label: 'Company' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={_users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
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
