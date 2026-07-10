import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { title: 'Overview', path: '/admin', icon: 'solar:home-angle-bold-duotone' as const },
  { title: 'Businesses', path: '/admin/businesses', icon: 'solar:settings-bold-duotone' as const },
  { title: 'Plans', path: '/admin/plans', icon: 'solar:receipt-bold' as const },
  { title: 'Tickets', path: '/admin/tickets', icon: 'solar:chat-round-dots-bold' as const },
  { title: 'Email', path: '/admin/email', icon: 'solar:share-bold' as const },
  { title: 'Feature flags', path: '/admin/feature-flags', icon: 'solar:shield-keyhole-bold-duotone' as const },
];

export function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          ShopMaster Admin
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Platform console
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Iconify icon={item.icon} width={22} />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          color="inherit"
          variant="outlined"
          onClick={() => {
            logout();
            navigate('/sign-in');
          }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          )}
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {user?.fullName || user?.name || 'Platform admin'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: { xs: 10, md: 11 },
          px: { xs: 2, md: 3 },
          pb: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
