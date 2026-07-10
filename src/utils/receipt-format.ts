/**
 * Receipt display helpers — capitalization + currency formatting
 * shared by preview UI and client PDF export.
 */

/** Title-case each word: "ada lovelace" → "Ada Lovelace" */
export function toTitleCase(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b([a-zà-öø-ÿ])/g, (ch) => ch.toUpperCase());
}

export function formatNgn(n: number): string {
  const abs = Math.abs(n ?? 0);
  const formatted = abs.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₦${formatted}`;
}

export function formatReceiptAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return toTitleCase(address);
  const a = address as Record<string, string>;
  return [a.street, a.city, a.state, a.country]
    .filter(Boolean)
    .map((part) => toTitleCase(part))
    .join(', ');
}
