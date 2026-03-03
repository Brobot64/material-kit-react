import type { IconButtonProps } from '@mui/material/IconButton';

import { usePopover } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
  data?: {
    value: string;
    label: string;
    icon: string;
  }[];
};

const STORAGE_KEY = 'app-locale';

export function LanguagePopover({ data = [], sx, ...other }: LanguagePopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();

  // Initialize locale from localStorage or default to first available language
  const getInitialLocale = (): string => {
    if (data.length === 0) return '';

    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(STORAGE_KEY);
      if (savedLocale && data.find((lang) => lang.value === savedLocale)) {
        return savedLocale;
      }
    }
    return data[0]?.value || '';
  };

  const [locale, setLocale] = useState<string>(() => getInitialLocale());

  // Sync locale from localStorage when data is available
  useEffect(() => {
    if (data.length > 0) {
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem(STORAGE_KEY);
        if (savedLocale && data.find((lang) => lang.value === savedLocale)) {
          setLocale(savedLocale);
          return;
        }
      }
      // If no saved locale or saved locale is invalid, use first available
      const currentLocaleExists = data.find((lang) => lang.value === locale);
      if (!currentLocaleExists && locale !== data[0].value) {
        setLocale(data[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChangeLang = useCallback(
    (newLang: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
      }
      setLocale(newLang);
      onClose();
    },
    [onClose]
  );

  const currentLang = data.find((lang) => lang.value === locale) || data[0];

  // Don't render if no data
  if (data.length === 0) {
    return null;
  }

  const renderFlag = (label?: string, icon?: string) => (
    <Box
      component="img"
      alt={label}
      src={icon}
      sx={{ width: 26, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
    />
  );

  const renderMenuList = () => (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuList
        sx={{
          p: 0.5,
          gap: 0.5,
          width: 160,
          minHeight: 72,
          display: 'flex',
          flexDirection: 'column',
          [`& .${menuItemClasses.root}`]: {
            px: 1,
            gap: 2,
            borderRadius: 0.75,
            [`&.${menuItemClasses.selected}`]: {
              bgcolor: 'action.selected',
              fontWeight: 'fontWeightSemiBold',
            },
          },
        }}
      >
        {data?.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang?.value}
            onClick={() => handleChangeLang(option.value)}
          >
            {renderFlag(option.label, option.icon)}
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Popover>
  );

  return (
    <>
      <IconButton
        aria-label="Languages button"
        onClick={onOpen}
        sx={[
          (theme) => ({
            p: 0,
            width: 40,
            height: 40,
            ...(open && { bgcolor: theme.vars.palette.action.selected }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {currentLang && (
          <Box
            key={locale}
            component="img"
            alt={currentLang.label}
            src={currentLang.icon}
            sx={{ width: 26, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
          />
        )}
      </IconButton>

      {renderMenuList()}
    </>
  );
}
