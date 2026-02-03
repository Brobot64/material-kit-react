import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
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
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Breadcrumbs } from 'src/components/breadcrumbs';

// ----------------------------------------------------------------------

export function CategoriesView() {
  const { appData, categories, refreshCategories } = useAuth(); // Assuming I'll add refreshCategories to AuthContext
  const businessId = appData?.businessId;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [popoverId, setPopoverId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
      setOpenPopover(event.currentTarget);
      setPopoverId(id);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setPopoverId(null);
  }, []);

  const handleOpenModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setNewCategory({ name: '', description: '', parentId: '' });
    setOpenModal(true);
  };

  const handleEditCategory = () => {
    const category = categories.find((c) => c._id === popoverId);
    if (category) {
      setEditMode(true);
      setSelectedCategory(category);
      setNewCategory({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
      });
      setOpenModal(true);
    }
    handleClosePopover();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveCategory = async () => {
    if (!businessId) return;
    try {
      if (editMode && selectedCategory) {
        await api.updateCategory(selectedCategory._id, newCategory);
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        await api.addCategory({ businessId, ...newCategory });
        setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      }

      // We should really have a way to refresh categories in the context
      if (refreshCategories) {
        await refreshCategories();
      }

      handleCloseModal();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save category',
        severity: 'error',
      });
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardContent>
      <Breadcrumbs links={[{ name: 'Dashboard', href: '/' }, { name: 'Categories' }]} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Category
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5, pb: 0 }}>
          <TextField
            fullWidth
            placeholder="Search categories..."
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
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Parent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow hover key={category._id}>
                      <TableCell>
                        <Typography variant="subtitle2" noWrap>
                          {category.name}
                        </Typography>
                      </TableCell>

                      <TableCell>{category.description || 'No description'}</TableCell>

                      <TableCell>
                        {categories.find((c) => c._id === category.parentId)?.name || 'None'}
                      </TableCell>

                      <TableCell>
                        <Label variant="soft" color={category.isActive ? 'success' : 'default'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{fDateTime(category.createdAt)}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenPopover(e, category._id)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCategories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
                          No categories found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>
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
            },
          }}
        >
          <MenuItem onClick={handleEditCategory}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </MenuList>
      </Popover>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? 'Edit Category' : 'Create New Category'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Parent Category (Optional)"
              value={newCategory.parentId}
              onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {categories
                .filter((c) => c._id !== selectedCategory?._id)
                .map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!newCategory.name.trim()}
          >
            {editMode ? 'Update' : 'Create'}
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
