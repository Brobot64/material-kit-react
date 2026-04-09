import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
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
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { NumericInput } from 'src/components/numeric-input';

import { AnalyticsOrderTimeline } from '../../overview/analytics-order-timeline';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProductDetailView({ id }: Props) {
  const router = useRouter();
  const { appData, categories } = useAuth();
  const businessId = appData?.businessId;

  const [currentTab, setCurrentTab] = useState('info');
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [outlets, setOutlets] = useState<any[]>([]);

  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [newVariant, setNewVariant] = useState({
    name: '',
    outletId: '',
    unit: 'unit',
    taxRate: 7.5,
    barcode: '',
    brand: '',
    description: '',
    sellingPrice: 0,
    costPrice: 0,
    minStock: 0,
    quantity: 0,
  });

  const [variantDetails, setVariantDetails] = useState([{ key: '', value: '' }]);
  const [productDetails, setProductDetails] = useState([{ key: '', value: '' }]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleAddVariantDetail = () => {
    setVariantDetails([...variantDetails, { key: '', value: '' }]);
  };

  const handleRemoveVariantDetail = (index: number) => {
    const updatedDetails = variantDetails.filter((_, i) => i !== index);
    setVariantDetails(updatedDetails.length ? updatedDetails : [{ key: '', value: '' }]);
  };

  const handleVariantDetailChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedDetails = [...variantDetails];
    updatedDetails[index][field] = value;
    setVariantDetails(updatedDetails);
  };

  const handleAddProductDetail = () => {
    setProductDetails([...productDetails, { key: '', value: '' }]);
  };

  const handleRemoveProductDetail = (index: number) => {
    const updatedDetails = productDetails.filter((_, i) => i !== index);
    setProductDetails(updatedDetails.length ? updatedDetails : [{ key: '', value: '' }]);
  };

  const handleProductDetailChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedDetails = [...productDetails];
    updatedDetails[index][field] = value;
    setProductDetails(updatedDetails);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productData, variantsData, logsData] = await Promise.all([
        api.getProduct(id),
        api.getVariants(id),
        api.getAuditLogs({ performedTo: id, limit: 20 }),
      ]);
      setProduct(productData);
      setVariants(variantsData);
      setAuditLogs(logsData.data);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (openVariantModal || openEditModal) {
      fetchOutlets();
    }
  }, [openVariantModal, openEditModal, fetchOutlets]);

  const handleOpenEditModal = () => {
    setEditProduct({
      name: product?.name || '',
      barcode: product?.barcode || '',
      brand: product?.brand || '',
      unit: product?.unit || 'unit',
      taxRate: product?.taxRate || 7.5,
      categoryId: product?.categoryId || '',
      description: product?.description || '',
    });
    if (product?.details && Object.keys(product.details).length > 0) {
      setProductDetails(
        Object.entries(product.details).map(([key, value]) => ({ key, value: String(value) }))
      );
    } else {
      setProductDetails([{ key: '', value: '' }]);
    }
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleUpdateProduct = async () => {
    try {
      const detailsObject = productDetails.reduce((acc, item) => {
        if (item.key.trim()) {
          acc[item.key.trim()] = item.value;
        }
        return acc;
      }, {} as any);

      await api.updateProduct(id, {
        ...editProduct,
        details: detailsObject,
      });

      setSnackbar({
        open: true,
        message: 'Product updated successfully!',
        severity: 'success',
      });
      handleCloseEditModal();
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update product',
        severity: 'error',
      });
    }
  };

  const handleOpenVariantModal = () => {
    setNewVariant({
      ...newVariant,
      name: product?.name || '',
      brand: product?.brand || '',
      unit: product?.unit || 'unit',
      taxRate: product?.taxRate || 7.5,
    });
    // Pre-populate details from parent if they exist
    if (product?.details && Object.keys(product.details).length > 0) {
      setVariantDetails(
        Object.entries(product.details).map(([key, value]) => ({ key, value: String(value) }))
      );
    } else {
      setVariantDetails([{ key: '', value: '' }]);
    }
    setOpenVariantModal(true);
  };

  const handleCloseVariantModal = () => setOpenVariantModal(false);

  const handleAddVariant = async () => {
    try {
      const detailsObject = variantDetails.reduce((acc, item) => {
        if (item.key.trim()) {
          acc[item.key.trim()] = item.value;
        }
        return acc;
      }, {} as any);

      const variantResponse = await api.addVariant(id, {
        name: newVariant.name,
        outletId: newVariant.outletId,
        unit: newVariant.unit,
        taxRate: newVariant.taxRate,
        barcode: newVariant.barcode,
        brand: newVariant.brand,
        description: newVariant.description,
        details: detailsObject,
      });

      if (newVariant.outletId) {
        await api.assignProductToOutlet({
          productId: variantResponse._id,
          outletId: newVariant.outletId,
          sellingPrice: newVariant.sellingPrice,
          costPrice: newVariant.costPrice,
          minStock: newVariant.minStock,
          quantity: newVariant.quantity,
        });
      }

      setSnackbar({
        open: true,
        message: 'Variant added successfully!',
        severity: 'success',
      });
      handleCloseVariantModal();
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add variant',
        severity: 'error',
      });
    }
  };

  if (loading && !product) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardContent>
      <Breadcrumbs
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'Products', href: '/products' },
          { name: product?.name || 'Product Details' },
        ]}
        sx={{ mb: 3 }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">{product?.name}</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={handleOpenEditModal}
          >
            Edit Product
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenVariantModal}
          >
            Add Variant
          </Button>
        </Stack>
      </Stack>

      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        <Tab value="info" label="Information" />
        <Tab value="variants" label={`Variants (${variants.length})`} />
        <Tab value="logs" label="Audit Logs" />
      </Tabs>

      {currentTab === 'info' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={product?.images?.[0]}
                variant="rounded"
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Label
                color={
                  (product?.stockStatus === 'IN_STOCK' && 'success') ||
                  (product?.stockStatus === 'LOW_STOCK' && 'warning') ||
                  'error'
                }
              >
                {product?.stockStatus?.replace('_', ' ')}
              </Label>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Details
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    SKU
                  </Typography>
                  <Typography variant="subtitle2">{product?.sku}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Category
                  </Typography>
                  <Typography variant="subtitle2">
                    {product?.categoryName ||
                      categories.find((c) => c._id === product?.categoryId)?.name ||
                      'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Brand
                  </Typography>
                  <Typography variant="subtitle2">{product?.brand || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Unit
                  </Typography>
                  <Typography variant="subtitle2">{product?.unit}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tax Rate
                  </Typography>
                  <Typography variant="subtitle2">{product?.taxRate}%</Typography>
                </Box>
                {product?.details &&
                  Object.entries(product.details).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
                      >
                        {key}
                      </Typography>
                      <Typography variant="subtitle2">{String(value)}</Typography>
                    </Box>
                  ))}
                <Divider />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Description
                </Typography>
                <Typography variant="body1">{product?.description || 'No description'}</Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 'variants' && (
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Variant Name</TableCell>
                    <TableCell>SKU</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow
                      key={variant._id}
                      hover
                      onClick={() => router.push(`/products/${variant._id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{variant.name}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      )}

      {currentTab === 'logs' && (
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <AnalyticsOrderTimeline
              title="Product History"
              list={auditLogs.map((log) => ({
                id: log._id,
                title: log.description || log.action,
                performer: log.actionBy?.name || 'System',
                type: log.action.includes('CREATE')
                  ? 'order1'
                  : log.action.includes('ADD')
                    ? 'order2'
                    : log.action.includes('UPDATE')
                      ? 'order3'
                      : log.action.includes('DELETE')
                        ? 'order4'
                        : 'order5',
                time: log.createdAt,
              }))}
            />
          </Grid>
        </Grid>
      )}

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
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <Typography variant="subtitle1">Specifications</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={editProduct.unit}
                      onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                    />
                    <NumericInput
                      fullWidth
                      label="Tax Rate (%)"
                      value={editProduct.taxRate}
                      onChangeValue={(val) => setEditProduct({ ...editProduct, taxRate: val })}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
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
                      <IconButton size="small" onClick={handleAddProductDetail} color="primary">
                        <Iconify icon="mingcute:add-line" />
                      </IconButton>
                    </Box>
                    <Stack spacing={2}>
                      {productDetails.map((detail, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            label="Key"
                            value={detail.key}
                            onChange={(e) => handleProductDetailChange(index, 'key', e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            label="Value"
                            value={detail.value}
                            onChange={(e) =>
                              handleProductDetailChange(index, 'value', e.target.value)
                            }
                            sx={{ flex: 1 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProductDetail(index)}
                            disabled={productDetails.length === 1 && !detail.key && !detail.value}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
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

      {/* Add Variant Modal */}
      <Dialog open={openVariantModal} onClose={handleCloseVariantModal} fullWidth maxWidth="md">
        <DialogTitle>Add Product Variant</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Typography variant="subtitle1">Variant Details</Typography>
                <TextField
                  fullWidth
                  label="Variant Name"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Barcode"
                  value={newVariant.barcode}
                  onChange={(e) => setNewVariant({ ...newVariant, barcode: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={newVariant.unit}
                    onChange={(e) => setNewVariant({ ...newVariant, unit: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Tax Rate (%)"
                    value={newVariant.taxRate}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, taxRate: parseFloat(e.target.value) })
                    }
                  />
                </Box>

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
                    <IconButton size="small" onClick={handleAddVariantDetail} color="primary">
                      <Iconify icon="mingcute:add-line" />
                    </IconButton>
                  </Box>
                  <Stack spacing={2}>
                    {variantDetails.map((detail, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          label="Key"
                          value={detail.key}
                          onChange={(e) => handleVariantDetailChange(index, 'key', e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          label="Value"
                          value={detail.value}
                          onChange={(e) =>
                            handleVariantDetailChange(index, 'value', e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveVariantDetail(index)}
                          disabled={variantDetails.length === 1 && !detail.key && !detail.value}
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
                <Typography variant="subtitle1">Inventory (Required)</Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Outlet"
                  value={newVariant.outletId}
                  onChange={(e) => setNewVariant({ ...newVariant, outletId: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet._id} value={outlet._id}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <NumericInput
                    fullWidth
                    label="Selling Price"
                    value={newVariant.sellingPrice}
                    onChangeValue={(val) =>
                      setNewVariant({ ...newVariant, sellingPrice: val })
                    }
                  />
                  <NumericInput
                    fullWidth
                    label="Cost Price"
                    value={newVariant.costPrice}
                    onChangeValue={(val) =>
                      setNewVariant({ ...newVariant, costPrice: val })
                    }
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <NumericInput
                    fullWidth
                    label="Quantity"
                    value={newVariant.quantity}
                    onChangeValue={(val) =>
                      setNewVariant({ ...newVariant, quantity: val })
                    }
                  />
                  <NumericInput
                    fullWidth
                    label="Min Stock"
                    value={newVariant.minStock}
                    onChangeValue={(val) =>
                      setNewVariant({ ...newVariant, minStock: val })
                    }
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariantModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddVariant}
            variant="contained"
            disabled={!newVariant.name || !newVariant.outletId}
          >
            Add Variant
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
