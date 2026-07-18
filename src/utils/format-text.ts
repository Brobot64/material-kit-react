/**
 * Display helpers for person / product names.
 */

/** Title-case each word: "sulayman ibrahim" → "Sulayman Ibrahim" */
export function toTitleCase(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b([a-zà-öø-ÿ])/g, (ch) => ch.toUpperCase());
}

/** MUI sx snippet for capitalized display of names / product titles */
export const capitalizeSx = { textTransform: 'capitalize' as const };
