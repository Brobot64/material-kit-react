import type { Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { OfflineBanner } from 'src/offline';
import { useAuth } from 'src/contexts/auth-context';

import { SubscriptionBanner } from 'src/components/subscription/subscription-banner';
import { NotificationToastStack } from 'src/components/notifications/notification-toast-stack';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { getNavForRole } from '../nav-config-dashboard';
import { AccountPopover } from '../components/account-popover';
import { ThemeModeButton } from '../components/theme-mode-button';
import { NotificationsPopover } from '../components/notifications-popover';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();

  const { setMode } = useColorScheme();

  const { user, outlets, appData } = useAuth();
  const filteredNav = getNavForRole(appData?.role, appData?.businessSettings?.features || appData?.features);

  useEffect(() => {
    if (user?.themePreference) {
      setMode(user.themePreference as 'light' | 'dark');
    }
  }, [user?.themePreference, setMode]);

  const workspaces: WorkspacesPopoverProps['data'] = outlets.map((outlet) => ({
    id: outlet._id,
    name: outlet.name,
    logo: '/assets/icons/workspaces/logo-1.webp',
    isMain: !!outlet.isMain,
    isActive: outlet.isActive,
  }));

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const { value: collapsed, onToggle: onToggleCollapsed } = useBoolean();

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile data={filteredNav} open={open} onClose={onClose} workspaces={workspaces} />
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          <Searchbar />

          {/** @slot Theme mode button */}
          <ThemeModeButton />

          {/** @slot Language popover */}
          {/* <LanguagePopover data={_langs} /> */}

          {/** @slot Notifications popover */}
          <NotificationsPopover />

          {/** @slot Account drawer */}
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection {...slotProps?.main}>
      <SubscriptionBanner />
      {children}
    </MainSection>
  );

  return (
    <>
      <NotificationToastStack />
      <OfflineBanner />
      <LayoutSection
        /** **************************************
         * @Header
         *************************************** */
        headerSection={renderHeader()}
        /** **************************************
         * @Sidebar
         *************************************** */
        sidebarSection={
          <NavDesktop
            data={filteredNav}
            layoutQuery={layoutQuery}
            workspaces={workspaces}
            collapsed={collapsed}
            onToggleCollapsed={onToggleCollapsed}
          />
        }
        /** **************************************
         * @Footer
         *************************************** */
        footerSection={renderFooter()}
        /** **************************************
         * @Styles
         *************************************** */
        cssVars={{ ...dashboardLayoutVars(theme, collapsed), ...cssVars }}
        sx={[
          {
            [`& .${layoutClasses.sidebarContainer}`]: {
              [theme.breakpoints.up(layoutQuery)]: {
                pl: 'var(--layout-nav-vertical-width)',
                transition: theme.transitions.create(['padding-left'], {
                  easing: 'var(--layout-transition-easing)',
                  duration: 'var(--layout-transition-duration)',
                }),
              },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {renderMain()}
      </LayoutSection>
    </>
  );
}
