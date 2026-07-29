import type { Locale } from '@/i18n/config';

export function formatPrice(value: number | null | undefined, locale: Locale, currency = 'EGP') {
  if (value == null) return '';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number | null | undefined, locale: Locale) {
  if (value == null) return '';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(value);
}
