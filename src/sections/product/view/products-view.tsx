import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function ProductsView() {
  const router = useRouter();
  const { appData } = useAuth();
  const businessId = appData?.businessId;

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openModal, setOpenModal] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    brand: '',
    unit: '1',
    taxRate: 7.5,
    description: '',
    outletId: '',
    sellingPrice: 0,
    costPrice: 0,
    minStock: 0,
    quantity: 0,
  });

  const fetchProducts = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await api.getProducts({
        businessId,
        page: pagination.page,
        limit: pagination.limit,
        includeVariants: true,
      });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, pagination.page, pagination.limit]);

  const fetchOutlets = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await api.getOutlets(businessId);
      setOutlets(data);
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  }, [businessId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (openModal) {
      fetchOutlets();
    }
  }, [openModal, fetchOutlets]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination({ ...pagination, page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({ ...pagination, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewProduct({
      name: '',
      barcode: '',
      brand: '',
      unit: '1',
      taxRate: 7.5,
      description: '',
      outletId: '',
      sellingPrice: 0,
      costPrice: 0,
      minStock: 0,
      quantity: 0,
    });
  };

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setOpenPopover(event.currentTarget);
    setSelectedProductId(id);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setSelectedProductId(null);
  }, []);

  const handleViewProduct = () => {
    if (selectedProductId) {
      router.push(`/products/${selectedProductId}`);
    }
    handleClosePopover();
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    try {
      await api.deleteProduct(selectedProductId);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });
      fetchProducts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete product',
        severity: 'error',
      });
    }
    handleClosePopover();
  };

  const handleCreateProduct = async () => {
    if (!businessId) return;
    try {
      const productResponse = await api.addProduct({
        businessId,
        outletId: newProduct.outletId,
        name: newProduct.name,
        barcode: newProduct.barcode,
        brand: newProduct.brand,
        unit: newProduct.unit,
        taxRate: newProduct.taxRate,
        description: newProduct.description,
        hasVariants: false,
        isActive: true,
      });

      const productId = productResponse._id;

      if (newProduct.outletId) {
        await api.assignProductToOutlet({
          productId,
          outletId: newProduct.outletId,
          sellingPrice: newProduct.sellingPrice,
          costPrice: newProduct.costPrice,
          minStock: newProduct.minStock,
          quantity: newProduct.quantity,
        });
      }

      setSnackbar({
        open: true,
        message: 'Product created and assigned successfully!',
        severity: 'success',
      });
      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to create product:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create product',
        severity: 'error',
      });
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
          onClick={handleOpenModal}
        >
          New Product
        </Button>
      </Box>

      <Card>
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
          <TableContainer sx={{ overflow: 'unset', minHeight: 400 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Stock Status</TableCell>
                    <TableCell>Quantity / Min</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow hover key={product._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            variant="rounded"
                            src={product.images?.[0] || ''}
                            sx={{ width: 48, height: 48 }}
                          >
                            {product.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                              {product.categoryName || 'No Category'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{product.sku}</TableCell>

                      <TableCell>
                        <Label
                          variant="soft"
                          color={
                            (product.stockStatus === 'IN_STOCK' && 'success') ||
                            (product.stockStatus === 'LOW_STOCK' && 'warning') ||
                            (product.stockStatus === 'OUT_OF_STOCK' && 'error') ||
                            'default'
                          }
                        >
                          {product.stockStatus?.replace('_', ' ') || 'UNKNOWN'}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {fNumber(product.totalQuantity || 0)} / {fNumber(product.totalMinStock || 0)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{fDateTime(product.createdAt)}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenPopover(e, product._id)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
                          No products found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={pagination.page - 1}
          count={pagination.total}
          rowsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>

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
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .MuiMenuItem-root`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.Mui-selected`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleViewProduct}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>

          <MenuItem onClick={handleViewProduct}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* New Product Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ py: 1 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1">General Information</Typography>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Barcode"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Tax Rate (%)"
                    value={newProduct.taxRate}
                    onChange={(e) => setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) })}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle1">Inventory Assignment</Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Outlet"
                  value={newProduct.outletId}
                  onChange={(e) => setNewProduct({ ...newProduct, outletId: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet._id} value={outlet._id}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Selling Price"
                  disabled={!newProduct.outletId}
                  value={newProduct.sellingPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) })}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Cost Price"
                  disabled={!newProduct.outletId}
                  value={newProduct.costPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) })}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    disabled={!newProduct.outletId}
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseFloat(e.target.value) })}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Stock"
                    disabled={!newProduct.outletId}
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: parseFloat(e.target.value) })}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            disabled={!newProduct.name || !newProduct.outletId}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}