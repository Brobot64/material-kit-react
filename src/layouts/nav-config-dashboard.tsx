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
    icon: icon('ic-dashboard'),
  },
  {
    title: 'Financial Overview',
    path: '/financial-overview',
    icon: icon('ic-analytics'),
  },
  // {
  //   title: 'Teams',
  //   path: '/teams',
  //   icon: icon('ic-user'),
  // },
  // {
  //   title: 'Projects',
  //   path: '/projects',
  //   icon: icon('ic-cart'),
  // },
  // {
  //   title: 'Chat',
  //   path: '/chat',
  //   icon: icon('ic-blog'),
  // },
  {
    title: 'Employees',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Product',
    path: '/products',
    icon: icon('ic-cart'),
    // children: [
    //   { title: 'Shop', path: '/products', icon: null },
    //   { title: 'List', path: '/product-list', icon: null },
    // ],
  },
  {
    title: 'Category',
    path: '/categories',
    icon: icon('ic-blog'), // Using ic-blog as a placeholder icon
  },
  // {
  //   title: 'Order',
  //   icon: icon('ic-order'),
  //   children: [
  //     { title: 'List', path: '/orders', icon: null },
  //     { title: 'Details', path: '/orders/details', icon: null },
  //   ],
  // },
  {
    title: 'Sales',
    icon: icon('ic-cart'),
    children: [
      { title: 'New Sale', path: '/sales', icon: null },
      { title: 'History', path: '/sales/history', icon: null },
      { title: 'Pending', path: '/sales/pending', icon: null },
    ],
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: icon('ic-customers'),
  },

  // Other sections
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },
];
