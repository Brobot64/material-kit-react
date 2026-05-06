import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter } from 'src/routes/hooks';

import { fToNow } from 'src/utils/format-time';

import { useNotifications } from 'src/contexts/notification-context';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
};

export type NotificationsPopoverProps = IconButtonProps & {
  data?: NotificationItemProps[];
  onViewAll?: () => void;
  onMarkAllAsRead?: (items: NotificationItemProps[]) => void | Promise<void>;
  groupBy?: (items: NotificationItemProps[]) => { label: string; items: NotificationItemProps[] }[];
};

export function NotificationsPopover({
  sx,
  onViewAll,
  onMarkAllAsRead,
  groupBy,
  ...other
}: NotificationsPopoverProps) {
  const router = useRouter();

  const { notifications: globalNotifications, markAllAsRead, unreadCount } = useNotifications();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleViewAll = useCallback(
    (viewAllHandler?: NotificationsPopoverProps['onViewAll']) => {
      handleClosePopover();
      if (viewAllHandler) {
        viewAllHandler();
        return;
      }
      router.push('/notifications');
    },
    [handleClosePopover, router]
  );

  const mappedNotifications: NotificationItemProps[] = globalNotifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.message,
    isUnRead: !notification.read,
    type: notification.type,
    avatarUrl: (notification.metadata?.avatarUrl as string) || null,
    postedAt: notification.createdAt,
  }));

  const sections: { label: string; items: NotificationItemProps[] }[] = groupBy?.(
    mappedNotifications
  ) ?? [
    { label: 'New', items: mappedNotifications.filter((n) => n.isUnRead) },
    { label: 'Before that', items: mappedNotifications.filter((n) => !n.isUnRead) },
  ];

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
          </Box>

          {unreadCount > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          {sections.map((section) => (
            <List
              key={section.label}
              disablePadding
              subheader={
                <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                  {section.label}
                </ListSubheader>
              }
            >
              {section.items.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </List>
          ))}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit" onClick={() => handleViewAll(onViewAll)}>
            View all
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({ notification }: { notification: NotificationItemProps }) {
  const { markAsRead } = useNotifications();
  const { avatarUrl, title } = renderContent(notification);

  const handleClick = () => {
    if (notification.isUnRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <ListItemButton
      onClick={handleClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatarUrl}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  const iconMap: Record<string, 'eva:checkmark-circle-2-fill' | 'eva:close-circle-fill' | 'eva:flash-fill' | 'eva:info-fill' | 'solar:bell-bing-bold-duotone'> = {
    success: 'eva:checkmark-circle-2-fill',
    error: 'eva:close-circle-fill',
    warning: 'eva:flash-fill',
    info: 'eva:info-fill',
  };
  const colorMap: Record<string, string> = {
    success: 'success.main',
    error: 'error.main',
    warning: 'warning.main',
    info: 'info.main',
  };
  const iconName = iconMap[notification.type] ?? 'solar:bell-bing-bold-duotone';
  const iconColor = colorMap[notification.type] ?? 'primary.main';

  return {
    avatarUrl: <Iconify icon={iconName} width={22} sx={{ color: iconColor }} />,
    title,
  };
}
