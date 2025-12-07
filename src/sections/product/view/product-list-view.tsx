import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { _products } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function ProductListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = _products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAllClick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredProducts.map((product) => product.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  }, [filteredProducts]);

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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sale': return 'error';
      case 'new': return 'info';
      default: return 'default';
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'Product', href: '/products' },
          { name: 'List' },
        ]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant="h4">Product List</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New Product
        </Button>
      </Box>

      <Card>
        {/* Search Bar */}
        <Box sx={{ p: 2.5, pb: 0 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
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
        </Box>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
                      checked={filteredProducts.length > 0 && selected.length === filteredProducts.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Create at</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Publish</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => {
                    const isItemSelected = isSelected(product.id);

                    return (
                      <TableRow
                        hover
                        key={product.id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={() => handleClick(product.id)}
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              variant="rounded"
                              src={product.coverUrl}
                              sx={{ width: 64, height: 64 }}
                            />
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                Category
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">12 Nov 2025</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            4:57 pm
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {Math.random() > 0.3 ? (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                  }}
                                />
                                <Typography variant="body2">72 in stock</Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                  }}
                                />
                                <Typography variant="body2">out of stock</Typography>
                              </Box>
                            </Box>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="subtitle2">${product.price}</Typography>
                        </TableCell>

                        <TableCell>
                          <Label variant="soft" color={product.status ? getStatusColor(product.status) : 'success'}>
                            {Math.random() > 0.5 ? 'Published' : 'Draft'}
                          </Label>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton>
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={filteredProducts.length}
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