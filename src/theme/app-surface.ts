import type { Theme, SystemStyleObject } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------
// Shared Whimsical surface styles for /app screens (not KPI widgets)
// Typed as theme callbacks (not SxProps) so they compose safely in sx arrays.
// ----------------------------------------------------------------------

export type AppSxCallback = (theme: Theme) => SystemStyleObject<Theme>;

export const appPanelSx: AppSxCallback = (theme) => ({
  borderRadius: '16px',
  border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)}`,
  boxShadow: theme.vars.customShadows.z1,
  bgcolor: 'common.white',
  ...theme.applyStyles('dark', {
    bgcolor: 'background.paper',
  }),
});

export const appStatTileSx: AppSxCallback = (theme) => ({
  p: 2.5,
  borderRadius: '12px',
  bgcolor: 'background.neutral',
  border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.06)}`,
  transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 180 }),
  '&:hover': {
    boxShadow: theme.vars.customShadows.z4,
    transform: 'translateY(-1px)',
  },
});

export const appProductTileSx =
  (disabled?: boolean): AppSxCallback =>
  (theme) => ({
    p: 2,
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.1)}`,
    bgcolor: 'common.white',
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
      duration: 160,
    }),
    ...theme.applyStyles('dark', { bgcolor: 'background.paper' }),
    ...(!disabled && {
      '&:hover': {
        bgcolor: 'background.neutral',
        borderColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
        boxShadow: theme.vars.customShadows.z1,
      },
    }),
  });

export const appFilterBarSx: SystemStyleObject<Theme> = {
  p: { xs: 2, sm: 2.5 },
  display: 'flex',
  gap: 2,
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'stretch', md: 'center' },
};
