import { varAlpha } from 'minimal-shared/utils';

import { info, error, common, primary, success, warning, secondary } from './palette';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extend-theme-types.d.ts}
 */

export interface CustomShadows {
  z1?: string;
  z4?: string;
  z8?: string;
  z12?: string;
  z16?: string;
  z20?: string;
  z24?: string;
  primary?: string;
  secondary?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  card?: string;
  dialog?: string;
  dropdown?: string;
}

// ----------------------------------------------------------------------

export function createShadowColor(colorChannel: string): string {
  return `0 8px 16px 0 ${varAlpha(colorChannel, 0.24)}`;
}

/** Plum-tinted elevation — Whimsical uses rgba(37, 8, 53, *) as shadow ink */
const PLUM_CHANNEL = '37 8 53';

function createCustomShadows(colorChannel: string): CustomShadows {
  return {
    z1: `0px 8px 16px -4px ${varAlpha(PLUM_CHANNEL, 0.04)}`,
    z4: `0px 8px 16px -4px ${varAlpha(PLUM_CHANNEL, 0.06)}`,
    z8: `0px 16px 32px -4px ${varAlpha(PLUM_CHANNEL, 0.06)}`,
    z12: `0px 16px 32px -4px ${varAlpha(PLUM_CHANNEL, 0.08)}`,
    z16: `0px 32px 64px -8px ${varAlpha(PLUM_CHANNEL, 0.08)}`,
    z20: `0px 32px 64px -8px ${varAlpha(PLUM_CHANNEL, 0.12)}`,
    z24: `0px 32px 64px -8px ${varAlpha(PLUM_CHANNEL, 0.16)}`,
    /********/
    dialog: `-40px 40px 80px -8px ${varAlpha(PLUM_CHANNEL, 0.2)}`,
    card: `0px 8px 16px -4px ${varAlpha(PLUM_CHANNEL, 0.04)}, 0px 16px 32px -4px ${varAlpha(PLUM_CHANNEL, 0.06)}`,
    dropdown: `0px 8px 16px -4px ${varAlpha(PLUM_CHANNEL, 0.08)}, -12px 16px 32px -4px ${varAlpha(PLUM_CHANNEL, 0.12)}`,
    /********/
    primary: createShadowColor(primary.mainChannel),
    secondary: createShadowColor(secondary.mainChannel),
    info: createShadowColor(info.mainChannel),
    success: createShadowColor(success.mainChannel),
    warning: createShadowColor(warning.mainChannel),
    error: createShadowColor(error.mainChannel),
  };
}

export const customShadows: Partial<Record<ThemeColorScheme, CustomShadows>> = {
  light: createCustomShadows(PLUM_CHANNEL),
  dark: createCustomShadows(common.blackChannel),
};
