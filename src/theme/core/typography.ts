import type { CSSObject, Breakpoint, TypographyVariantsOptions } from '@mui/material/styles';

import { pxToRem, setFont } from 'minimal-shared/utils';

import { createTheme as getTheme } from '@mui/material/styles';

import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------
// Whimsical: Montserrat display (Agrandir substitute) + Manrope chrome
// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extend-theme-types.d.ts}
 */
export type FontStyleExtend = {
  fontWeightSemiBold: CSSObject['fontWeight'];
  fontSecondaryFamily: CSSObject['fontFamily'];
};

export type ResponsiveFontSizesInput = Partial<Record<Breakpoint, number>>;
export type ResponsiveFontSizesResult = Record<string, { fontSize: string }>;

const defaultMuiTheme = getTheme();

function responsiveFontSizes(obj: ResponsiveFontSizesInput): ResponsiveFontSizesResult {
  const breakpoints: Breakpoint[] = defaultMuiTheme.breakpoints.keys;

  return breakpoints.reduce((acc, breakpoint) => {
    const value = obj[breakpoint];

    if (value !== undefined && value >= 0) {
      acc[defaultMuiTheme.breakpoints.up(breakpoint)] = {
        fontSize: pxToRem(value),
      };
    }

    return acc;
  }, {} as ResponsiveFontSizesResult);
}

// ----------------------------------------------------------------------

const primaryFont = setFont(themeConfig.fontFamily.primary);
const secondaryFont = setFont(themeConfig.fontFamily.secondary);

export const typography: TypographyVariantsOptions = {
  fontFamily: primaryFont,
  fontSecondaryFamily: secondaryFont,
  fontWeightLight: '300',
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemiBold: '600',
  fontWeightBold: '700',
  h1: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontSize: pxToRem(40),
    ...responsiveFontSizes({ sm: 52, md: 64, lg: 72 }),
  },
  h2: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontSize: pxToRem(32),
    ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
  },
  h3: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 26, md: 28, lg: 32 }),
  },
  h4: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ md: 24 }),
  },
  h5: {
    fontFamily: secondaryFont,
    fontWeight: 700,
    lineHeight: 1.3,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 19 }),
  },
  h6: {
    fontFamily: primaryFont,
    fontWeight: 700,
    lineHeight: 28 / 18,
    fontSize: pxToRem(17),
    ...responsiveFontSizes({ sm: 18 }),
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize: pxToRem(16),
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
    letterSpacing: '0.01em',
  },
  body1: {
    fontWeight: 500,
    lineHeight: 22.4 / 16,
    fontSize: pxToRem(16),
  },
  body2: {
    fontWeight: 600,
    lineHeight: 19.6 / 14,
    fontSize: pxToRem(14),
    letterSpacing: '0.01em',
  },
  caption: {
    fontWeight: 700,
    lineHeight: 16.8 / 12,
    fontSize: pxToRem(12),
    letterSpacing: '0.02em',
  },
  overline: {
    fontFamily: primaryFont,
    fontWeight: 700,
    lineHeight: 1.2,
    fontSize: pxToRem(9),
    letterSpacing: '1.35px',
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: primaryFont,
    fontWeight: 700,
    lineHeight: 1,
    fontSize: pxToRem(13),
    letterSpacing: '0.12px',
    textTransform: 'unset',
  },
};
