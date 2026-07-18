import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Shared app page chrome — Whimsical kicker + display heading
// ----------------------------------------------------------------------

export type PageHeaderProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ kicker, title, subtitle, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        {kicker && (
          <Typography
            variant="overline"
            sx={{ display: 'block', mb: 0.75, color: 'primary.main' }}
          >
            {kicker}
          </Typography>
        )}
        <Typography
          variant="h3"
          sx={{
            fontFamily: (theme) => theme.typography.fontSecondaryFamily,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            fontSize: { xs: 24, sm: 28, md: 32 },
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{ mt: 1, color: 'text.secondary', maxWidth: 560, fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ flexShrink: 0, displaySelf: { xs: 'stretch', sm: 'center' } }}>{action}</Box>
      )}
    </Stack>
  );
}
