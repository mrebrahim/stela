import { getLocale, getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations();
  return (
    <footer className="border-t bg-slate-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex flex-col md:flex-row gap-3 justify-between">
        <div>© {new Date().getFullYear()} {t('brand.name')}</div>
        <div className="flex gap-4">
          <a href={`/${locale}/about`}>{t('nav.about')}</a>
          <a href={`/${locale}/contact`}>{t('nav.contact')}</a>
        </div>
      </div>
    </footer>
  );
}
