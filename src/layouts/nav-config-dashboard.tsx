import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  info?: React.ReactNode;
  children?: NavItem[];
  roles?: string[];
};

export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/app',
    icon: icon('ic-dashboard'),
  },
  {
    title: 'Financial Overview',
    path: '/app/financial-overview',
    icon: icon('ic-analytics'),
    roles: ['owner', 'system_admin'],
  },
  {
    title: 'Bargaining Analytics',
    path: '/app/bargaining-analytics',
    icon: icon('ic-ecommerce'),
    roles: ['owner', 'outlet_admin', 'system_admin'],
  },
  {
    title: 'Outlets',
    path: '/app/outlets',
    icon: icon('ic-banking'),
    roles: ['owner', 'system_admin'],
  },
  {
    title: 'Employees',
    path: '/app/user',
    icon: icon('ic-user'),
    roles: ['owner', 'outlet_admin', 'store_executive', 'system_admin'],
  },
  {
    title: 'Products',
    path: '/app/products',
    icon: icon('ic-kanban'),
    roles: ['owner', 'outlet_admin', 'store_executive', 'system_admin'],
  },
  {
    title: 'Inventory',
    path: '/app/inventory',
    icon: icon('ic-file'),
    roles: ['owner', 'outlet_admin', 'store_executive'],
  },
  {
    title: 'Categories',
    path: '/app/categories',
    icon: icon('ic-blog'),
    roles: ['owner', 'system_admin'],
  },
  {
    title: 'Sales',
    icon: icon('ic-cart'),
    children: [
      { title: 'New Sale', path: '/app/sales' },
      { title: 'History', path: '/app/sales/history' },
      { title: 'Pending', path: '/app/sales/pending' },
      { title: 'Swaps', path: '/app/swaps' },
      { title: 'Returns & Warranty', path: '/app/returns' },
    ],
  },
  {
    title: 'Receivables',
    path: '/app/receivables',
    icon: icon('ic-analytics'),
    roles: ['owner', 'outlet_admin', 'store_executive', 'system_admin'],
  },
  {
    title: 'Customers',
    path: '/app/customers',
    icon: icon('ic-customers'),
  },
  {
    title: 'Stocktake',
    path: '/app/stocktake',
    icon: icon('ic-course'),
    roles: ['owner', 'outlet_admin', 'store_executive'],
  },
  {
    title: 'Receipt Template',
    path: '/app/receipt-template',
    icon: icon('ic-invoice'),
    roles: ['owner', 'system_admin'],
  },
  {
    title: 'Business Settings',
    path: '/app/settings',
    icon: icon('ic-analytics'),
    roles: ['owner', 'system_admin'],
  },
  {
    title: 'Audit Trail',
    path: '/app/audit-logs',
    icon: icon('ic-blog'),
    roles: ['owner', 'outlet_admin', 'store_executive', 'system_admin'],
  },
];

export function getNavForRole(role: string | undefined): NavItem[] {
  if (!role) return navData.filter((item) => !item.roles);
  return navData.filter((item) => !item.roles || item.roles.includes(role));
}
