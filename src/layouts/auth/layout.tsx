import type { CSSObject, Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';

import { AuthContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';

import type { AuthContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type AuthLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: AuthContentProps;
  };
};

export function AuthLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthLayoutProps) {
  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = { container: { maxWidth: false } };

    const headerSlots: HeaderSectionProps['slots'] = {
      leftArea: (
        <Box sx={{ color: 'common.white', '& svg, & img': { filter: 'brightness(0) invert(1)' } }}>
          <Logo />
        </Box>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Link
            href="#"
            component={RouterLink}
            sx={{
              typography: 'button',
              color: 'common.white',
              opacity: 0.85,
              '&:hover': { opacity: 1 },
            }}
          >
            Need help?
          </Link>
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
        sx={[
          {
            position: { [layoutQuery]: 'fixed' },
            color: 'common.white',
            bgcolor: 'transparent',
          },
          ...(Array.isArray(slotProps?.header?.sx)
            ? (slotProps?.header?.sx ?? [])
            : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        (theme) => ({
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: theme.spacing(4, 2, 6, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            p: theme.spacing(10, 0, 8, 0),
          },
        }),
        ...(Array.isArray(slotProps?.main?.sx)
          ? (slotProps?.main?.sx ?? [])
          : [slotProps?.main?.sx]),
      ]}
    >
      <AuthContent {...slotProps?.content}>{children}</AuthContent>
    </MainSection>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      footerSection={renderFooter()}
      cssVars={{ '--layout-auth-content-width': '440px', ...cssVars }}
      sx={[
        {
          position: 'relative',
          '&::before': backgroundStyles(),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}

// ----------------------------------------------------------------------

const backgroundStyles = (): CSSObject => ({
  zIndex: 0,
  width: '100%',
  height: '100%',
  content: "''",
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, #250835 0%, #4a1568 35%, #7a2db8 55%, #ba59ff 78%, #d478ff 100%)',
  '&::after': {
    content: "''",
    position: 'absolute',
    inset: 0,
    opacity: 0.12,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    backgroundSize: '180px',
    mixBlendMode: 'overlay',
  },
});
