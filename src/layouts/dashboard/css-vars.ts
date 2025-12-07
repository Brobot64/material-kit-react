import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme, collapsed?: boolean) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-vertical-width': collapsed ? '88px' : '300px',
    '--layout-nav-collapsed-width': '88px',
    '--layout-dashboard-content-pt': theme.spacing(1),
    '--layout-dashboard-content-pb': theme.spacing(8),
    '--layout-dashboard-content-px': theme.spacing(5),
  };
}
