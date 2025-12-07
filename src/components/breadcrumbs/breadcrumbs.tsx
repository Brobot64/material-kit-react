import type { Theme, SxProps } from '@mui/material/styles';

import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// ----------------------------------------------------------------------

export type BreadcrumbsProps = {
  links: {
    name: string;
    href?: string;
  }[];
  sx?: SxProps<Theme>;
};

export function Breadcrumbs({ links, sx }: BreadcrumbsProps) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <MuiBreadcrumbs
        separator="•"
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.disabled',
            mx: 1,
          },
        }}
      >
        {links.map((link, index) => {
          const isLast = index === links.length - 1;

          return isLast ? (
            <Typography
              key={link.name}
              variant="body2"
              sx={{
                color: 'text.disabled',
                fontWeight: 'fontWeightMedium',
              }}
            >
              {link.name}
            </Typography>
          ) : (
            <Typography
              key={link.name}
              component={Link}
              to={link.href || '/'}
              variant="body2"
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                fontWeight: 'fontWeightMedium',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {link.name}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}