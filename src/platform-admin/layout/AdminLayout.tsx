import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemButton from '@mui/material/ListItemButton';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        bgcolor: 'common.white',
        ...theme.applyStyles('dark', { bgcolor: 'background.paper' }),
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Platform
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: theme.typography.fontSecondaryFamily,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          ShopMaster Admin
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Console
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 1.5 }}>
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
                sx={{
                  borderRadius: '12px',
                  minHeight: 44,
                  typography: 'button',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'common.white' },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: selected ? 'inherit' : 'text.secondary' }}>
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
          variant="outlined"
          color="primary"
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
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          bgcolor: 'common.white',
          ...theme.applyStyles('dark', { bgcolor: 'background.paper' }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 64 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <Iconify icon="custom:menu-duotone" />
            </IconButton>
          )}
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700 }}>
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
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            },
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
          px: { xs: 2, sm: 3, md: 4 },
          pb: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
