import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { _orders } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All', count: 0 },
  { value: 'pending', label: 'Pending', count: 0 },
  { value: 'completed', label: 'Completed', count: 0 },
  { value: 'cancelled', label: 'Cancelled', count: 0 },
  { value: 'refunded', label: 'Refunded', count: 0 },
];

// ----------------------------------------------------------------------

export function OrderView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Update tab counts
  const statusCounts = _orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tabsWithCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === 'all' ? _orders.length : (statusCounts[tab.value] || 0),
  }));

  // Filter orders
  const filteredOrders = _orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleSelectAllClick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredOrders.map((order) => order.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  }, [filteredOrders]);

  const handleClick = useCallback((id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  }, [selected]);

  const handleExpandRow = useCallback((orderId: string) => {
    setExpandedRows(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'Order', href: '/orders' },
          { name: 'List' },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 5 }}>
        Orders
      </Typography>

      <Card>
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onChange={(event, newValue) => {
            setStatusFilter(newValue);
            setPage(0);
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

        {/* Search Bar */}
        <Box sx={{ p: 2.5, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search customer or order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, minWidth: 'fit-content' }}>
              <TextField
                label="Start date"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="End date"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
            </Box>
          </Box>
        </Box>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredOrders.length}
                      checked={filteredOrders.length > 0 && selected.length === filteredOrders.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => {
                    const isItemSelected = isSelected(order.id);
                    const isExpanded = expandedRows.includes(order.id);

                    return (
                      <>
                        <TableRow
                          hover
                          key={order.id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={() => handleClick(order.id)}
                            />
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle2"
                                component="a"
                                href="#"
                                sx={{ color: 'primary.main', textDecoration: 'underline' }}
                              >
                                {order.id}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleExpandRow(order.id)}
                              >
                                <Iconify
                                  icon={isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                                  width={16}
                                />
                              </IconButton>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                alt={order.customer.name}
                                src={order.customer.avatarUrl}
                                sx={{ width: 36, height: 36 }}
                              />
                              <Box>
                                <Typography variant="subtitle2">{order.customer.name}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {order.customer.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2">{order.date}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {order.time}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="subtitle2">{order.items}</Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="subtitle2">${order.price}</Typography>
                          </TableCell>

                          <TableCell>
                            <Label variant="soft" color={getStatusColor(order.status)}>
                              {order.status}
                            </Label>
                          </TableCell>

                          <TableCell align="right">
                            <IconButton>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Product List */}
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2, pl: 6 }}>
                                {order.products.map((product, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                      py: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1,
                                        bgcolor: 'grey.200',
                                        backgroundImage: `url(/assets/images/product/product-${index + 1}.webp)`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                      }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2">{product.name}</Typography>
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {product.sku}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                                      x{product.quantity}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ minWidth: 80 }}>
                                      ${product.price}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </DashboardContent>
  );
}