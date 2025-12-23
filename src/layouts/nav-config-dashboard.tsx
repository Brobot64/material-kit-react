import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  info?: React.ReactNode;
  children?: NavItem[];
};

export const navData = [
  // Overview Section
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Teams',
    path: '/teams',
    icon: icon('ic-user'),
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: icon('ic-cart'),
  },
  {
    title: 'Chat',
    path: '/chat',
    icon: icon('ic-blog'),
  },
  {
    title: 'User',
    icon: icon('ic-user'),
    children: [
      { title: 'Profile', path: '/user/profile', icon: null },
      { title: 'Cards', path: '/user/cards', icon: null },
      { title: 'List', path: '/user', icon: null },
      { title: 'Create', path: '/user/create', icon: null },
      { title: 'Edit', path: '/user/edit', icon: null },
      { title: 'Account', path: '/user/account', icon: null },
    ],
  },
  {
    title: 'Product',
    icon: icon('ic-cart'),
    children: [
      { title: 'Shop', path: '/products', icon: null },
      { title: 'List', path: '/product-list', icon: null },
    ],
  },
  {
    title: 'Order',
    icon: icon('ic-order'),
    children: [
      { title: 'List', path: '/orders', icon: null },
      { title: 'Details', path: '/orders/details', icon: null },
    ],
  },
  
  // Other sections
  {
    title: 'Blog',
    path: '/blog',
    icon: icon('ic-blog'),
  },
];
