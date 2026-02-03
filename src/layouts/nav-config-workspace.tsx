import type { WorkspacesPopoverProps } from './components/workspaces-popover';

// ----------------------------------------------------------------------

export const _workspaces: WorkspacesPopoverProps['data'] = [
  {
    id: 'team-1',
    name: 'Team 1',
    logo: '/assets/icons/workspaces/logo-1.webp',
    isMain: true,
    isActive: true,
  },
  {
    id: 'team-2',
    name: 'Team 2',
    logo: '/assets/icons/workspaces/logo-2.webp',
    isMain: false,
    isActive: true,
  },
  {
    id: 'team-3',
    name: 'Team 3',
    logo: '/assets/icons/workspaces/logo-3.webp',
    isMain: false,
    isActive: false,
  },
];
