import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { useAuth } from 'src/contexts/auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ThemeModeButton() {
  const { mode } = useColorScheme();
  const { toggleTheme } = useAuth();

  const onToggleMode = () => {
    toggleTheme();
  };

  return (
    <IconButton onClick={onToggleMode} sx={{ color: 'text.secondary' }}>
      <Iconify
        width={24}
        icon={mode === 'dark' ? 'solar:sun-bold-duotone' : 'solar:moon-bold-duotone'}
      />
    </IconButton>
  );
}
