import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------
// Whimsical design tokens → ShopMaster theme
// Source: whimsical.design.md
// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'shopmaster',
  /** **************************************
   * Typography — Manrope (chrome) + Montserrat (display / Agrandir substitute)
   *************************************** */
  fontFamily: {
    primary: 'Manrope',
    secondary: 'Montserrat',
  },
  /** **************************************
   * Palette — deep plum primary, lilac surfaces
   *************************************** */
  palette: {
    primary: {
      lighter: '#efe3ed', // surface-lilac
      light: '#e9bded', // primary-pale
      main: '#250835', // deep plum
      dark: '#1a0526',
      darker: '#0f0318',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#f5e6ff',
      light: '#d4a0ff',
      main: '#ba59ff', // primary-light
      dark: '#8a2fd4',
      darker: '#5c1899',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#e3f0ff',
      light: '#8fc4ff',
      main: '#3ca1ff', // accent-aqua
      dark: '#1a6fc4',
      darker: '#0d457a',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#fdfcfd',
      '100': '#f5f4f5', // warm off-white canvas
      '200': '#efe3ed', // surface-lilac
      '300': '#e0d4de',
      '400': '#c4b0c2',
      '500': '#9a8498',
      '600': '#6b5569',
      '700': '#453544',
      '800': '#250835', // plum as ink
      '900': '#14041c',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
