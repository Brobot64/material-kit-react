import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme, collapsed?: boolean) {
  return {
    '--layout-transition-easing': 'cubic-bezier(0.16, 1, 0.3, 1)',
    '--layout-transition-duration': '200ms',
    '--layout-nav-vertical-width': collapsed ? '88px' : '280px',
    '--layout-nav-collapsed-width': '88px',
    '--layout-dashboard-content-pt': theme.spacing(2.5),
    '--layout-dashboard-content-pb': theme.spacing(6),
    '--layout-dashboard-content-px': theme.spacing(3),
  };
}
