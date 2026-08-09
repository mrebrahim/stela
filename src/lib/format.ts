import type { Locale } from '@/i18n/config';

const INTL: Record<Locale, string> = { ar: 'ar-EG', en: 'en-US', ru: 'ru-RU', zh: 'zh-CN' };

export function formatPrice(value: number | null | undefined, locale: Locale, currency = 'EGP') {
  if (value == null) return '';
  return new Intl.NumberFormat(INTL[locale] ?? 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number | null | undefined, locale: Locale) {
  if (value == null) return '';
  return new Intl.NumberFormat(INTL[locale] ?? 'en-US').format(value);
}
