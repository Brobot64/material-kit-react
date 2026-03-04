import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  siteUrl: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Tajarah | ShopMaster',
  appVersion: packageJson.version,
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://tajarah.com',
};
