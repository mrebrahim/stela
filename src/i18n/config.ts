export const locales = ['ar', 'en', 'ru', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';
export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = { ar: 'rtl', en: 'ltr', ru: 'ltr', zh: 'ltr' };
export const localeLabels: Record<Locale, string> = { ar: 'العربية', en: 'English', ru: 'Русский', zh: '中文' };
