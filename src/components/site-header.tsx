'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';

export function SiteHeader() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const pathname = usePathname();
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const otherHref = pathname.replace(/^\/(ar|en)/, `/${otherLocale}`) || `/${otherLocale}`;

  const link = (href: string) => `/${locale}${href}`;

  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={`/${locale}`} className="font-bold text-stella-700 text-lg">
          {t('brand.name')}
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href={link('/buy')} className="hover:text-stella-600">{t('nav.buy')}</Link>
          <Link href={link('/rent')} className="hover:text-stella-600">{t('nav.rent')}</Link>
          <Link href={link('/list-your-unit')} className="hover:text-stella-600">{t('nav.listYourUnit')}</Link>
        </nav>
        <div className="ms-auto flex items-center gap-3 text-sm">
          <Link href={otherHref} className="rounded border px-2 py-1 hover:bg-slate-50">
            {otherLocale === 'ar' ? t('common.arabic') : t('common.english')}
          </Link>
        </div>
      </div>
    </header>
  );
}
