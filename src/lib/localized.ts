import type { Locale } from '@/i18n/config';

type WithI18nText = {
  title_ar: string | null; title_en: string | null; title_ru: string | null; title_zh: string | null;
  description_ar: string | null; description_en: string | null; description_ru: string | null; description_zh: string | null;
  locales?: string[];
};

export function localizedTitle(l: WithI18nText, locale: Locale): string | null {
  const primary = l[`title_${locale}` as const];
  if (primary && primary.trim()) return primary;
  return l.title_en || l.title_ar || l.title_ru || l.title_zh || null;
}

export function localizedDescription(l: WithI18nText, locale: Locale): string | null {
  const primary = l[`description_${locale}` as const];
  if (primary && primary.trim()) return primary;
  return l.description_en || l.description_ar || l.description_ru || l.description_zh || null;
}
