import type { BoxProps } from '@mui/material/Box';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type AuthContentProps = BoxProps;

export function AuthContent({ sx, children, className, ...other }: AuthContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          py: { xs: 3.5, sm: 4.5 },
          px: { xs: 2.5, sm: 4 },
          width: 1,
          zIndex: 2,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 'var(--layout-auth-content-width)',
          bgcolor: theme.vars.palette.common.white,
          boxShadow: theme.vars.customShadows.z16,
          border: `1px solid ${theme.vars.palette.primary.light}`,
          ...theme.applyStyles('dark', {
            bgcolor: theme.vars.palette.background.paper,
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}
