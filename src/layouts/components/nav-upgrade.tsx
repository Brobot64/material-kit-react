import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type NavUpgradeProps = StackProps & {
  onClose?: () => void;
};

export function NavUpgrade({ sx, onClose, ...other }: NavUpgradeProps) {
  return (
    <Box
      sx={[
        {
          p: 2,
          mb: 4,
          display: 'flex',
          textAlign: 'center',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {onClose ? (
        <IconButton
          size="small"
          aria-label="Dismiss upgrade section"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      ) : null}

      <Typography
        variant="h6"
        sx={[
          (theme) => ({
            background: `linear-gradient(to right, ${theme.vars.palette.secondary.main}, ${theme.vars.palette.warning.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            color: 'transparent',
          }),
        ]}
      >
        More features?
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {`From only `}
        <Box component="strong" sx={{ color: 'text.primary' }}>
          $69
        </Box>
      </Typography>

      <Box
        component="img"
        alt="Minimal dashboard"
        src="/assets/illustrations/illustration-dashboard.webp"
        sx={{ width: 200, my: 2 }}
      />

      <Button
        href="https://material-ui.com/store/items/minimal-dashboard/"
        target="_blank"
        variant="contained"
        color="inherit"
      >
        Upgrade to Pro
      </Button>
    </Box>
  );
}
