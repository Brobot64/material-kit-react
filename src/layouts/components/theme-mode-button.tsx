import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ThemeModeButton() {
  const { mode, setMode } = useColorScheme();

  const onToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
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
