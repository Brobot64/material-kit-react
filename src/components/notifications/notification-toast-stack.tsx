import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useNotifications } from 'src/contexts/notification-context';

// ----------------------------------------------------------------------

const TYPE_SEVERITY_MAP = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

export function NotificationToastStack() {
  const { activeToasts, dismissToast } = useNotifications();

  if (activeToasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 9999,
        width: 360,
        pointerEvents: 'none',
      }}
    >
      <Stack spacing={1}>
        {activeToasts.map((toast) => (
          <Slide key={toast.toastId} direction="left" in mountOnEnter unmountOnExit>
            <Alert
              severity={TYPE_SEVERITY_MAP[toast.type] ?? 'info'}
              onClose={() => dismissToast(toast.toastId)}
              sx={{
                pointerEvents: 'auto',
                boxShadow: (theme) => theme.shadows[8],
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
                {toast.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {toast.message}
              </Typography>
            </Alert>
          </Slide>
        ))}
      </Stack>
    </Box>
  );
}
