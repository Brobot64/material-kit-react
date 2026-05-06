'use client';

import { useMemo } from 'react';

import { useBusinessSettings } from 'src/hooks/useBusinessSettings';

import { ThemeProvider } from './theme-provider';

// Converts a hex string like #2563eb to { r, g, b } channels for MUI CSS vars
function hexToChannel(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function lighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = Math.min(255, parseInt(clean.substring(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(clean.substring(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(clean.substring(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = Math.max(0, parseInt(clean.substring(0, 2), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(clean.substring(2, 4), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(clean.substring(4, 6), 16) - Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

type Props = { children: React.ReactNode };

export function BusinessThemeProvider({ children }: Props) {
  const { settings } = useBusinessSettings();

  const themeOverrides = useMemo(() => {
    const primary = settings?.brandPrimaryColor ?? '#2563eb';
    const secondary = settings?.brandSecondaryColor ?? '#7c3aed';

    return {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              lighter: lighten(primary, 0.45),
              light: lighten(primary, 0.2),
              main: primary,
              dark: darken(primary, 0.1),
              darker: darken(primary, 0.25),
              contrastText: '#ffffff',
            },
            secondary: {
              lighter: lighten(secondary, 0.45),
              light: lighten(secondary, 0.2),
              main: secondary,
              dark: darken(secondary, 0.1),
              darker: darken(secondary, 0.25),
              contrastText: '#ffffff',
            },
          },
        },
        dark: {
          palette: {
            primary: {
              lighter: lighten(primary, 0.45),
              light: lighten(primary, 0.2),
              main: primary,
              dark: darken(primary, 0.1),
              darker: darken(primary, 0.25),
              contrastText: '#ffffff',
            },
          },
        },
      },
    } as any;
  }, [settings?.brandPrimaryColor, settings?.brandSecondaryColor]);

  return (
    <ThemeProvider themeOverrides={themeOverrides}>
      {children}
    </ThemeProvider>
  );
}
