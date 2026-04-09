import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { api } from 'src/services/api';
import { useAuth } from 'src/contexts/auth-context';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
    logo: string;
    isMain: boolean;
    isActive: boolean;
  }[];
};

export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
  const { appData, refreshOutlets } = useAuth();
  
  const isOwner = appData?.role === 'owner';
  
  const [workspace, setWorkspace] = useState(data.find(d => d.id === appData?.outletId) || data[0]);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  
  const [openModal, setOpenModal] = useState(false);

  const [newOutlet, setNewOutlet] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
    },
    phone: '',
    isMain: false,
  });
  
  useEffect(() => {
    if (data.length > 0) {
      const assignedOutlet = data.find(d => d.id === appData?.outletId);
      if (assignedOutlet) {
        setWorkspace(assignedOutlet);
      } else if (!workspace) {
        setWorkspace(data[0]);
      }
    }
  }, [data, appData?.outletId, workspace]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isOwner) {
      setOpenPopover(event.currentTarget);
    }
  }, [isOwner]);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[number]) => {
      setWorkspace(newValue);
      handleClosePopover();
    },
    [handleClosePopover]
  );

  const handleCreateOutlet = async () => {
    try {
      if (!appData?.businessId) throw new Error('Business ID not found');
      
      await api.createOutlet({
        ...newOutlet,
        businessId: appData.businessId,
      });
      
      await refreshOutlets();
      setOpenModal(false);
      setNewOutlet({ 
        name: '', 
        address: { street: '', city: '', state: '', country: 'Nigeria' }, 
        phone: '', 
        isMain: false 
      });
      handleClosePopover();
    } catch (error) {
      console.error('Failed to create outlet:', error);
      alert(error instanceof Error ? error.message : 'Failed to create outlet');
    }
  };

  const renderAvatar = (alt: string, src: string, isActive: boolean) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box
        component="img"
        alt={alt}
        src={src}
        sx={{ width: 24, height: 24, borderRadius: '50%' }}
      />
      <Box
        sx={{
          right: -2,
          bottom: -2,
          width: 8,
          height: 8,
          borderRadius: '50%',
          position: 'absolute',
          border: (theme) => `solid 2px ${theme.vars.palette.background.paper}`,
          bgcolor: isActive ? 'success.main' : 'error.main',
        }}
      />
    </Box>
  );

  const renderLabel = (isMain: boolean) => (isMain ? <Label color="info">Main</Label> : null);

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={handleOpenPopover}
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: 'left',
          justifyContent: 'flex-start',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          ...sx,
        }}
        {...other}
      >
        {renderAvatar(workspace?.name ?? '', workspace?.logo ?? '', !!workspace?.isActive)}

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            typography: 'body2',
            fontWeight: 'fontWeightSemiBold',
          }}
        >
          {workspace?.name}
          {renderLabel(!!workspace?.isMain)}
        </Box>

        <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
      </ButtonBase>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover}>
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 260,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              p: 1.5,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: {
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
            >
              {renderAvatar(option.name, option.logo, option.isActive)}

              <Box component="span" sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>

              {renderLabel(option.isMain)}
            </MenuItem>
          ))}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              setOpenModal(true);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 'fontWeightSemiBold',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mingcute:add-line" />
            Add New Outlet
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Add New Outlet Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
          <Typography variant="h6">Add New Outlet</Typography>
          
          <TextField
            fullWidth
            label="Outlet Name"
            value={newOutlet.name}
            onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Street Address"
            value={newOutlet.address.street}
            onChange={(e) => setNewOutlet({ ...newOutlet, address: { ...newOutlet.address, street: e.target.value } })}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="City"
              value={newOutlet.address.city}
              onChange={(e) => setNewOutlet({ ...newOutlet, address: { ...newOutlet.address, city: e.target.value } })}
            />
            <TextField
              fullWidth
              label="State"
              value={newOutlet.address.state}
              onChange={(e) => setNewOutlet({ ...newOutlet, address: { ...newOutlet.address, state: e.target.value } })}
            />
          </Box>

          <TextField
            fullWidth
            label="Country"
            value={newOutlet.address.country}
            onChange={(e) => setNewOutlet({ ...newOutlet, address: { ...newOutlet.address, country: e.target.value } })}
          />
          
          <TextField
            fullWidth
            label="Phone"
            value={newOutlet.phone}
            onChange={(e) => setNewOutlet({ ...newOutlet, phone: e.target.value })}
          />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isMain"
              checked={newOutlet.isMain}
              onChange={(e) => setNewOutlet({ ...newOutlet, isMain: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="isMain">Is Main Outlet?</label>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateOutlet} color="primary">Create</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
