import type { Notification } from 'src/types';
import type { IconifyName } from 'src/components/iconify/register-icons';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useNotifications } from 'src/contexts/notification-context';

// ----------------------------------------------------------------------

const TYPE_COLOR_MAP = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

const TYPE_ICON_MAP: Record<string, IconifyName> = {
  success: 'eva:checkmark-circle-2-fill',
  error: 'eva:close-circle-fill',
  warning: 'eva:flash-fill',
  info: 'eva:info-fill',
};

function NotificationRow({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotifications();
  const color = TYPE_COLOR_MAP[notification.type] ?? 'default';
  const icon: IconifyName = TYPE_ICON_MAP[notification.type] ?? 'solar:bell-bing-bold-duotone';

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        bgcolor: notification.read ? 'transparent' : 'action.selected',
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s',
        cursor: 'default',
      }}
    >
      <Box
        sx={{
          mt: 0.25,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}.lighter`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={20} sx={{ color: `${color}.main` }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
          {notification.title}
          {!notification.read && (
            <Box
              component="span"
              sx={{
                ml: 1,
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'error.main',
                verticalAlign: 'middle',
              }}
            />
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {notification.message}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconify icon="solar:clock-circle-outline" width={13} />
          {fToNow(notification.createdAt)}
        </Typography>
      </Box>

      {!notification.read && (
        <IconButton
          size="small"
          onClick={() => markAsRead(notification.id)}
          sx={{ mt: 0.25, flexShrink: 0 }}
          title="Mark as read"
        >
          <Iconify icon="eva:done-all-fill" width={18} />
        </IconButton>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NotificationsView() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="eva:done-all-fill" />}
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </Stack>

      <Card>
        {notifications.length === 0 && (
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Iconify icon="solar:bell-bing-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              You&apos;ll see alerts for sales, stock, and more here
            </Typography>
          </CardContent>
        )}

        {unread.length > 0 && (
          <>
            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="overline" color="text.secondary">
                Unread
              </Typography>
              <Chip label={unread.length} size="small" color="error" sx={{ height: 20, fontSize: 11 }} />
            </Box>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {unread.map((n) => (
              <Box key={n.id}>
                <NotificationRow notification={n} />
                <Divider sx={{ borderStyle: 'dashed', opacity: 0.4 }} />
              </Box>
            ))}
          </>
        )}

        {read.length > 0 && (
          <>
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                Earlier
              </Typography>
            </Box>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {read.map((n) => (
              <Box key={n.id}>
                <NotificationRow notification={n} />
                <Divider sx={{ borderStyle: 'dashed', opacity: 0.4 }} />
              </Box>
            ))}
          </>
        )}
      </Card>
    </Box>
  );
}
