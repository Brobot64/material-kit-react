import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { NavUpgrade } from '../components/nav-upgrade';
import { WorkspacesPopover } from '../components/workspaces-popover';

import type { NavItem } from '../nav-config-dashboard';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
  collapsed,
  onToggleCollapsed,
}: NavContentProps & { 
  layoutQuery: Breakpoint;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent 
        data={data} 
        slots={slots} 
        workspaces={workspaces} 
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ 
  data, 
  slots, 
  workspaces, 
  sx, 
  collapsed,
  onToggleCollapsed 
}: NavContentProps) {
  const pathname = usePathname();
  const [showUpgrade, setShowUpgrade] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleToggleExpand = useCallback((title: string) => {
    setExpandedItems(prev => 
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  }, []);

  const renderNavItem = useCallback((item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = item.children?.some(child => child.path === pathname);
    const isActive = item.path === pathname;

    return (
      <ListItem key={item.title} disableGutters disablePadding>
        <Box sx={{ width: '100%' }}>
          <ListItemButton
            disableGutters
            component={item.path ? RouterLink : 'div'}
            href={item.path}
            onClick={hasChildren ? () => handleToggleExpand(item.title) : undefined}
            sx={[
              (theme) => ({
                pl: collapsed ? 1.5 : 2 + (level * 1),
                py: 1,
                gap: collapsed ? 0 : 2,
                pr: collapsed ? 1.5 : 1.5,
                borderRadius: 0.75,
                typography: 'body2',
                fontWeight: 'fontWeightMedium',
                color: theme.vars.palette.text.secondary,
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                cursor: hasChildren ? 'pointer' : 'default',
                ...((isActive || isParentActive) && {
                  fontWeight: 'fontWeightSemiBold',
                  color: theme.vars.palette.primary.main,
                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                  '&:hover': {
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                  },
                }),
              }),
            ]}
            title={collapsed ? item.title : undefined}
          >
            {level === 0 && (
              <Box component="span" sx={{ 
                width: 24, 
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </Box>
            )}

            {!collapsed && (
              <>
                <Box component="span" sx={{ flexGrow: 1 }}>
                  {item.title}
                </Box>
                {item.info && item.info}
                {hasChildren && (
                  <Iconify
                    icon={isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                    width={16}
                  />
                )}
              </>
            )}
          </ListItemButton>
          
          {/* Render children */}
          {hasChildren && !collapsed && (
            <Collapse in={isExpanded}>
              <Box sx={{ pl: 2 }}>
                {item.children!.map((child) => renderNavItem(child, level + 1))}
              </Box>
            </Collapse>
          )}
        </Box>
      </ListItem>
    );
  }, [pathname, collapsed, expandedItems, handleToggleExpand]);

  return (
    <>
      {/* Logo and Toggle Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        mb: 2
      }}>
        {!collapsed && <Logo />}
        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Logo sx={{ width: 40, height: 40 }} />
          </Box>
        )}
        {onToggleCollapsed && (
          <IconButton
            onClick={onToggleCollapsed}
            sx={{
              ml: collapsed ? 0 : 'auto',
              color: 'text.secondary'
            }}
          >
            <Iconify 
              icon={collapsed ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-downward-fill'} 
              width={16} 
            />
          </IconButton>
        )}
      </Box>

      {!collapsed && slots?.topArea}

      {!collapsed && <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => renderNavItem(item))}
          </Box>
        </Box>
      </Scrollbar>

      {!collapsed && slots?.bottomArea}


      <NavUpgrade />
    </>
  );
}
