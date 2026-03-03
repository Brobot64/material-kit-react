import type { BoxProps } from '@mui/material/Box';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useCallback, type FormEvent } from 'react';

import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function Searchbar({ sx, ...other }: BoxProps) {
  const theme = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, []);

  const getRouteFromQuery = useCallback((query: string): string => {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);

    // Helper to check if query starts with or is exactly a keyword
    const matchesKeyword = (keyword: string): boolean =>
      normalizedQuery === keyword ||
      normalizedQuery.startsWith(`${keyword} `) ||
      words[0] === keyword ||
      normalizedQuery.includes(` ${keyword} `) ||
      normalizedQuery.endsWith(` ${keyword}`);

    // User page keywords - check first
    if (
      matchesKeyword('user') ||
      matchesKeyword('users') ||
      matchesKeyword('member') ||
      matchesKeyword('members') ||
      matchesKeyword('customer') ||
      matchesKeyword('customers') ||
      matchesKeyword('client') ||
      matchesKeyword('clients') ||
      normalizedQuery === 'u'
    ) {
      return '/user';
    }

    // Products page keywords
    if (
      matchesKeyword('product') ||
      matchesKeyword('products') ||
      matchesKeyword('item') ||
      matchesKeyword('items') ||
      matchesKeyword('goods') ||
      matchesKeyword('merchandise') ||
      normalizedQuery === 'p'
    ) {
      return '/products';
    }

    // Dashboard/Home keywords
    if (
      matchesKeyword('dashboard') ||
      matchesKeyword('home') ||
      matchesKeyword('main') ||
      matchesKeyword('overview') ||
      normalizedQuery === 'd'
    ) {
      return '/';
    }

    // Blog page keywords - only if explicitly mentioned
    if (
      matchesKeyword('blog') ||
      matchesKeyword('blogs') ||
      matchesKeyword('post') ||
      matchesKeyword('posts') ||
      matchesKeyword('article') ||
      matchesKeyword('articles') ||
      matchesKeyword('news') ||
      normalizedQuery === 'b'
    ) {
      return `/blog?search=${encodeURIComponent(query.trim())}`;
    }

    // Default: search in blog with query (for general searches)
    return `/blog?search=${encodeURIComponent(query.trim())}`;
  }, []);

  const handleSearch = useCallback(
    (e?: FormEvent | React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      e?.stopPropagation();

      const query = searchQuery.trim();
      if (query) {
        const route = getRouteFromQuery(query);
        router.push(route);
        handleClose();
      }
    },
    [searchQuery, router, handleClose, getRouteFromQuery]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
          const route = getRouteFromQuery(query);
          router.push(route);
          handleClose();
        }
      }
    },
    [searchQuery, router, handleClose, getRouteFromQuery]
  );

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              top: 0,
              left: 0,
              zIndex: 99,
              width: '100%',
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              px: { xs: 3, md: 5 },
              boxShadow: theme.vars.customShadows.z8,
              height: {
                xs: 'var(--layout-header-mobile-height)',
                md: 'var(--layout-header-desktop-height)',
              },
              backdropFilter: `blur(6px)`,
              WebkitBackdropFilter: `blur(6px)`,
              backgroundColor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
              ...sx,
            }}
            {...other}
          >
            <Input
              autoFocus
              fullWidth
              disableUnderline
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search…"
              startAdornment={
                <InputAdornment position="start">
                  <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              }
              sx={{ fontWeight: 'fontWeightBold' }}
            />
            <Button
              type="submit"
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </Box>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
