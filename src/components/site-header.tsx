'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Hero pages get a transparent-over-image header until scroll
  const transparentOverHero = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = (href: string) => `/${locale}${href}`;

  const solid = scrolled || !transparentOverHero;

  return (
    <header
      className={
        'sticky top-0 z-40 transition-colors ' +
        (solid
          ? 'bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900'
          : 'bg-transparent text-white')
      }
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <span className={
            'inline-flex w-8 h-8 rounded-lg items-center justify-center font-black text-sm shadow-card ' +
            (solid ? 'bg-stella-700 text-white' : 'bg-white text-stella-800')
          }>
            SK
          </span>
          <span className={'font-bold text-lg ' + (solid ? 'text-stella-800' : 'text-white')}>
            {t('brand.name')}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href={link('/buy')} className="hover:opacity-70 transition">{t('nav.buy')}</Link>
          <Link href={link('/rent')} className="hover:opacity-70 transition">{t('nav.rent')}</Link>
          <Link href={link('/list-your-unit')} className="hover:opacity-70 transition">{t('nav.listYourUnit')}</Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher tone={solid ? 'solid' : 'ghost'} />
          <Link
            href={link('/list-your-unit')}
            className="hidden sm:inline-flex bg-sand-500 hover:bg-sand-600 text-white rounded-full text-sm px-4 py-1.5 font-semibold transition"
          >
            {t('cta.listYourUnit')}
          </Link>
        </div>
      </div>
    </header>
  );
}
