import Typography, { type TypographyProps } from '@mui/material/Typography';

import { toTitleCase } from 'src/utils/format-text';

// ----------------------------------------------------------------------

type NameTextProps = TypographyProps & {
  /** Raw name / product title — rendered in title case */
  value?: unknown;
  children?: React.ReactNode;
};

/**
 * Display person names, usernames, and product names in title case
 * (e.g. "sulayman ibrahim" → "Sulayman Ibrahim").
 */
export function NameText({ value, children, sx, ...other }: NameTextProps) {
  const content = children ?? toTitleCase(value);

  return (
    <Typography
      component="span"
      {...other}
      sx={[{ textTransform: 'capitalize' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {typeof content === 'string' ? toTitleCase(content) : content}
    </Typography>
  );
}
