import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
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
import { formatError } from 'src/utils/format-error';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';
import { appPanelSx, appFilterBarSx } from 'src/theme/app-surface';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PageHeader } from 'src/components/page-header';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { NumericInput } from 'src/components/numeric-input';

import { ProductUploadDialog } from '../product-upload-dialog';

// ----------------------------------------------------------------------

export function ProductListView() {
  const router = useRouter();
  const { appData, categories, outlets: contextOutlets } = useAuth();
  const businessId = appData?.businessId;

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOutletId, setFilterOutletId] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Edit modal state
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editProductData, setEditProductData] = useState<any>(null); // full product with productOutlets  
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [outletForm, setOutletForm] = useState({
    sellingPrice: 0,
    currentCost: 0,
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    costPriceMethod: 'FIFO',
    isActive: true,
  });
  const [editProductDetails, setEditProductDetails] = useState([{ key: '', value: '' }]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPagination((prev: any) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, startDate, endDate, filterOutletId]);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, product: any) => {
      setOpenPopover(event.currentTarget);
      setSelectedProductId(product._id);
      setSelectedProduct(product);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setSelectedProductId(null);
    setSelectedProduct(null);
  }, []);

  const handleViewProduct = () => {
    if (selectedProductId) {
      router.push(`/app/products/${selectedProductId}`);
    }
    handleClosePopover();
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    handleClosePopover();

    const productData = selectedProduct;
    const outletsList: any[] = productData.outlets || productData.productOutlets || [];

    const normalised = { ...productData, productOutlets: outletsList.map((o) => ({ ...o, outletId: o.outletId || o._id })) };
    setEditProductData(normalised);

    setEditProduct({
      name: productData.name || '',
      barcode: productData.barcode || '',
      brand: productData.brand || '',
      unit: productData.unit || 'unit',
      taxRate: productData.taxRate || 7.5,
      categoryId: productData.categoryId || '',
      description: productData.description || '',
    });

    if (productData.details && Object.keys(productData.details).length > 0) {
      setEditProductDetails(
        Object.entries(productData.details).map(([key, value]) => ({ key, value: String(value) }))        
      );
    } else {
      setEditProductDetails([{ key: '', value: '' }]);
    }

    if (outletsList.length > 0) {
      const firstOutlet = outletsList[0];
      setSelectedOutletId(firstOutlet.outletId || firstOutlet._id);
      setOutletForm({
        sellingPrice: firstOutlet.sellingPrice || 0,
        currentCost: firstOutlet.costPrice || firstOutlet.currentCost || 0,
        quantity: firstOutlet.quantity || 0,
        minStock: firstOutlet.minStock || 0,
        maxStock: firstOutlet.maxStock || 0,
        costPriceMethod: firstOutlet.costPriceMethod || 'FIFO',
        isActive: firstOutlet.isActive !== undefined ? firstOutlet.isActive : true,
      });
    }

    await fetchOutlets();
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditProduct(null);
    setEditProductData(null);
    setSelectedOutletId('');
  };

  const handleEditOutletChange = (event: any) => {
    const outletId = event.target.value;
    setSelectedOutletId(outletId);
    const outletData = editProductData?.productOutlets?.find((o: any) => o.outletId === outletId);        
    if (outletData) {
      setOutletForm({
        sellingPrice: outletData.sellingPrice || 0,
        currentCost: outletData.costPrice || outletData.currentCost || 0,
        quantity: outletData.quantity || 0,
        minStock: outletData.minStock || 0,
        maxStock: outletData.maxStock || 0,
        costPriceMethod: outletData.costPriceMethod || 'FIFO',
        isActive: outletData.isActive !== undefined ? outletData.isActive : true,
      });
    }
  };

  const handleAddEditProductDetail = () => {
    setEditProductDetails([...editProductDetails, { key: '', value: '' }]);
  };

  const handleRemoveEditProductDetail = (index: number) => {
    const updated = editProductDetails.filter((_, i) => i !== index);
    setEditProductDetails(updated.length ? updated : [{ key: '', value: '' }]);
  };

  const handleEditProductDetailChange = (index: number, field: 'key' | 'value', value: string) => {       
    const updated = [...editProductDetails];
    updated[index][field] = value;
    setEditProductDetails(updated);
  };

  const handleUpdateProduct = async () => {
    if (!editProductData?._id) return;
    try {
      const detailsObject = editProductDetails.reduce((acc, item) => {
        if (item.key.trim()) {
          acc[item.key.trim()] = item.value;
        }
        return acc;
      }, {} as any);

      await api.updateProduct(editProductData._id, {
        ...editProduct,
        details: detailsObject,
      });

      if (selectedOutletId) {
        await api.updateProductOutlet(editProductData._id, selectedOutletId, outletForm);
      }

      setSnackbar({
        open: true,
        message: 'Product updated successfully!',
        severity: 'success',
      });
      handleCloseEditModal();
      fetchProducts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: formatError(error),
        severity: 'error',
      });
    }
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
        message: formatError(error),
        severity: 'error',
      });
    }
    handleClosePopover();
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    brand: '',
    unit: '1',
    taxRate: 7.5,
    categoryId: '',
    description: '',
    outletId: '',
    sellingPrice: 0,
    costPrice: 0,
    minStock: 0,
    quantity: 0,
  });

  const [details, setDetails] = useState([{ key: '', value: '' }]);

  const handleAddDetail = () => {
    setDetails([...details, { key: '', value: '' }]);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails.length ? updatedDetails : [{ key: '', value: '' }]);
  };

  const handleDetailChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index][field] = value;
    setDetails(updatedDetails);
  };

  const fetchProducts = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await api.getProducts({
        businessId,
        page: pagination.page,
        limit: pagination.limit,
        includeVariants: true,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        outletId: filterOutletId || undefined,
      });
      // The backend returns { data: [...], pagination: {...} } or { results: [...], pagination: {...} }
      const results = response.results || response.data || [];
      setProducts(results);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, pagination.page, pagination.limit, debouncedSearch, startDate, endDate, filterOutletId]);

  const fetchOutlets = useCallback(async () => {
    if (!businessId) return;
    try {
      if (contextOutlets && contextOutlets.length > 0) {
        setOutlets(contextOutlets);
      } else {
        const data = await api.getOutlets(businessId);
        setOutlets(data.map((o: any) => ({ ...o, id: o._id })));
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  }, [businessId, contextOutlets]);

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
      categoryId: '',
      description: '',
      outletId: '',
      sellingPrice: 0,
      costPrice: 0,
      minStock: 0,
      quantity: 0,
    });
    setDetails([{ key: '', value: '' }]);
  };

  const handleCreateProduct = async () => {
    if (!businessId) return;
    try {
      const detailsObject = details.reduce((acc, item) => {
        if (item.key.trim()) {
          acc[item.key.trim()] = item.value;
        }
        return acc;
      }, {} as any);

      // 1. Add Product
      const productResponse = await api.addProduct({
        businessId,
        outletId: newProduct.outletId,
        name: newProduct.name,
        barcode: newProduct.barcode,
        brand: newProduct.brand,
        unit: newProduct.unit,
        taxRate: newProduct.taxRate,
        categoryId: newProduct.categoryId,
        description: newProduct.description,
        details: detailsObject,
        hasVariants: false,
        isActive: true,
      });

      const productId = productResponse._id;

      // 2. Assign to Outlet
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
        message: formatError(error),
        severity: 'error',
      });
    }
  };

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/app' },
          { name: 'Product', href: '/app/products' },
          { name: 'List' },
        ]}
      />

      <PageHeader
        kicker="Catalog"
        title="Product list"
        subtitle="Manage products, pricing, and barcodes for your outlets."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: 1, sm: 'auto' } }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={() => setOpenUploadDialog(true)}
            >
              Import CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenModal}
            >
              New Product
            </Button>
          </Stack>
        }
      />

      <ProductUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={fetchProducts}
      />

      <Card sx={appPanelSx}>
        <Box sx={appFilterBarSx}>
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
              endAdornment: loading && searchQuery !== debouncedSearch && (
                <InputAdornment position="end">
                   <CircularProgress size={20} color="inherit" />
                </InputAdornment>
              )
            }}
          />

          <Stack direction="row" spacing={2} sx={{ width: { xs: 1, md: 'auto' } }}>
            <TextField
              size="small"
              label="From"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              select
              size="small"
              label="Outlet"
              value={filterOutletId}
              onChange={(e) => setFilterOutletId(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Outlets</MenuItem>
              {(contextOutlets && contextOutlets.length > 0 ? contextOutlets : outlets).map((outlet) => (
                <MenuItem key={outlet._id || outlet.id} value={outlet._id || outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
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
                            <Typography variant="subtitle2" noWrap className="sm-name">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap className="sm-name">
                              {product.categoryName ||
                                categories.find((c) => c._id === product.categoryId)?.name ||
                                'No Category'}
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
                          {fNumber(product.totalQuantity || 0)} /{' '}
                          {fNumber(product.totalMinStock || 0)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{fDateTime(product.createdAt)}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenPopover(e, product)}>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
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

          <MenuItem onClick={handleEditProduct}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Edit Product Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="md">
        <DialogTitle>Edit Product Information</DialogTitle>
        <DialogContent dividers>
          {editProduct && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1">General Information</Typography>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Barcode"
                    value={editProduct.barcode}
                    onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="Brand"
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Category"
                    value={editProduct.categoryId}
                    onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2">Additional Details</Typography>
                      <IconButton size="small" onClick={handleAddEditProductDetail} color="primary">
                        <Iconify icon="mingcute:add-line" />
                      </IconButton>
                    </Box>
                    <Stack spacing={2}>
                      {editProductDetails.map((detail, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            label="Key"
                            value={detail.key}
                            onChange={(e) =>
                              handleEditProductDetailChange(index, 'key', e.target.value)
                            }
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            label="Value"
                            value={detail.value}
                            onChange={(e) =>
                              handleEditProductDetailChange(index, 'value', e.target.value)
                            }
                            sx={{ flex: 1 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveEditProductDetail(index)}
                            disabled={
                              editProductDetails.length === 1 && !detail.key && !detail.value
                            }
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1">Outlet Specific Data</Typography>
                  <TextField
                    select
                    fullWidth
                    label="Outlet Assignment"
                    value={selectedOutletId}
                    onChange={handleEditOutletChange}
                    helperText={
                      editProductData?.productOutlets?.length > 1
                        ? 'Select an outlet to edit its specific details'
                        : ''
                    }
                  >
                    {(outlets.length > 0 ? outlets : contextOutlets).map((po: any) => {
                      const outletId = po.outletId || po._id || po.id;
                      return (
                        <MenuItem key={outletId} value={outletId}>
                          {outlets.find((o) => o._id === outletId || o.id === outletId)?.name || po.name || outletId}
                        </MenuItem>
                      );
                    })}
                  </TextField>

                  <NumericInput
                    fullWidth
                    label="Selling Price"
                    value={outletForm.sellingPrice}
                    onChangeValue={(val) => setOutletForm({ ...outletForm, sellingPrice: val })}
                  />
                  <NumericInput
                    fullWidth
                    label="Current Cost"
                    value={outletForm.currentCost}
                    onChangeValue={(val) => setOutletForm({ ...outletForm, currentCost: val })}
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <NumericInput
                      fullWidth
                      label="Quantity"
                      value={outletForm.quantity}
                      onChangeValue={(val) => setOutletForm({ ...outletForm, quantity: val })}
                    />
                    <NumericInput
                      fullWidth
                      label="Min Stock"
                      value={outletForm.minStock}
                      onChangeValue={(val) => setOutletForm({ ...outletForm, minStock: val })}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <NumericInput
                      fullWidth
                      label="Max Stock"
                      value={outletForm.maxStock}
                      onChangeValue={(val) => setOutletForm({ ...outletForm, maxStock: val })}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Cost Method"
                      value={outletForm.costPriceMethod}
                      onChange={(e) =>
                        setOutletForm({ ...outletForm, costPriceMethod: e.target.value })
                      }
                    >
                      <MenuItem value="FIFO">FIFO</MenuItem>
                      <MenuItem value="WA">Weighted Average</MenuItem>
                    </TextField>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, description: e.target.value })
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdateProduct} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Product Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ py: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
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
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
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
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, taxRate: parseFloat(e.target.value) })
                    }
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

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2">Additional Details</Typography>
                    <IconButton size="small" onClick={handleAddDetail} color="primary">
                      <Iconify icon="mingcute:add-line" />
                    </IconButton>
                  </Box>
                  <Stack spacing={2}>
                    {details.map((detail, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          label="Key (e.g. Color)"
                          value={detail.key}
                          onChange={(e) => handleDetailChange(index, 'key', e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          label="Value"
                          value={detail.value}
                          onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveDetail(index)}
                          disabled={details.length === 1 && !detail.key && !detail.value}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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
                  {(outlets.length > 0 ? outlets : contextOutlets).map((outlet) => (
                    <MenuItem key={outlet._id || outlet.id} value={outlet._id || outlet.id}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </TextField>

                <NumericInput
                  fullWidth
                  label="Selling Price"
                  disabled={!newProduct.outletId}
                  value={newProduct.sellingPrice}
                  onChangeValue={(val) =>
                    setNewProduct({ ...newProduct, sellingPrice: val })
                  }
                />
                <NumericInput
                  fullWidth
                  label="Cost Price"
                  disabled={!newProduct.outletId}
                  value={newProduct.costPrice}
                  onChangeValue={(val) =>
                    setNewProduct({ ...newProduct, costPrice: val })
                  }
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <NumericInput
                    fullWidth
                    label="Quantity"
                    disabled={!newProduct.outletId}
                    value={newProduct.quantity}
                    onChangeValue={(val) =>
                      setNewProduct({ ...newProduct, quantity: val })
                    }
                  />
                  <NumericInput
                    fullWidth
                    label="Min Stock"
                    disabled={!newProduct.outletId}
                    value={newProduct.minStock}
                    onChangeValue={(val) =>
                      setNewProduct({ ...newProduct, minStock: val })
                    }
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
