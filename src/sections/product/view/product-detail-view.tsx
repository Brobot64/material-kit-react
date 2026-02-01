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
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

import { AnalyticsOrderTimeline } from '../../overview/analytics-order-timeline';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProductDetailView({ id }: Props) {
  const { appData } = useAuth();
  const businessId = appData?.businessId;

  const [currentTab, setCurrentTab] = useState('info');
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [outlets, setOutlets] = useState<any[]>([]);

  const [openVariantModal, setOpenVariantModal] = useState(false);
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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
    if (openVariantModal) {
      fetchOutlets();
    }
  }, [openVariantModal, fetchOutlets]);

  const handleOpenVariantModal = () => {
    setNewVariant({
      ...newVariant,
      name: product?.name || '',
      brand: product?.brand || '',
      unit: product?.unit || 'unit',
      taxRate: product?.taxRate || 7.5,
    });
    setOpenVariantModal(true);
  };

  const handleCloseVariantModal = () => setOpenVariantModal(false);

  const handleAddVariant = async () => {
    try {
      const variantResponse = await api.addVariant(id, {
        name: newVariant.name,
        outletId: newVariant.outletId,
        unit: newVariant.unit,
        taxRate: newVariant.taxRate,
        barcode: newVariant.barcode,
        brand: newVariant.brand,
        description: newVariant.description,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenVariantModal}
        >
          Add Variant
        </Button>
      </Stack>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newPage => newValue)}
        sx={{ mb: 3 }}
      >
        <Tab value="info" label="Information" />
        <Tab value="variants" label={`Variants (${variants.length})`} />
        <Tab value="logs" label="Audit Logs" />
      </Tabs>

      {currentTab === 'info' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={8}>
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
                  <Typography variant="subtitle2">{product?.categoryName || 'N/A'}</Typography>
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
                    <TableCell>Stock Status</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant._id} hover>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell>
                        <Label
                          color={
                            (variant.stockStatus === 'IN_STOCK' && 'success') ||
                            (variant.stockStatus === 'LOW_STOCK' && 'warning') ||
                            'error'
                          }
                        >
                          {variant.stockStatus?.replace('_', ' ')}
                        </Label>
                      </TableCell>
                      <TableCell>{fNumber(variant.totalQuantity)}</TableCell>
                      <TableCell>{fCurrency(variant.price || 0)}</TableCell>
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
          <Grid item xs={12} md={8}>
            <AnalyticsOrderTimeline
              title="Product History"
              list={auditLogs.map((log) => ({
                id: log._id,
                title: log.description || log.action,
                performer: log.actionBy?.name || 'System',
                type: log.action.includes('CREATE') ? 'order1' : 
                      log.action.includes('ADD') ? 'order2' : 
                      log.action.includes('UPDATE') ? 'order3' : 
                      log.action.includes('DELETE') ? 'order4' : 'order5',
                time: log.createdAt,
              }))}
            />
          </Grid>
        </Grid>
      )}

      {/* Add Variant Modal */}
      <Dialog open={openVariantModal} onClose={handleCloseVariantModal} fullWidth maxWidth="md">
        <DialogTitle>Add Product Variant</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
                    onChange={(e) => setNewVariant({ ...newVariant, taxRate: parseFloat(e.target.value) })}
                  />
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
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
                  <TextField
                    fullWidth
                    type="number"
                    label="Selling Price"
                    value={newVariant.sellingPrice}
                    onChange={(e) => setNewVariant({ ...newVariant, sellingPrice: parseFloat(e.target.value) })}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Cost Price"
                    value={newVariant.costPrice}
                    onChange={(e) => setNewVariant({ ...newVariant, costPrice: parseFloat(e.target.value) })}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    value={newVariant.quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, quantity: parseFloat(e.target.value) })}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Stock"
                    value={newVariant.minStock}
                    onChange={(e) => setNewVariant({ ...newVariant, minStock: parseFloat(e.target.value) })}
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
