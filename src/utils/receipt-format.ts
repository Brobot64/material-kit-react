/**
 * Receipt display helpers — capitalization + currency formatting
 * shared by preview UI and client PDF export.
 */

export { toTitleCase } from './format-text';
import { toTitleCase } from './format-text';

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
