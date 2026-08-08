'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { locales, localeLabels, type Locale } from '@/i18n/config';

export function LocaleSwitcher({ tone }: { tone: 'solid' | 'ghost' }) {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function hrefFor(target: Locale) {
    return pathname.replace(/^\/(ar|en|ru|zh)/, `/${target}`) || `/${target}`;
  }

  const btn =
    'rounded-full text-sm px-3 py-1.5 border transition inline-flex items-center gap-1.5 ' +
    (tone === 'solid'
      ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
      : 'border-white/40 text-white hover:bg-white/10');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={btn}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden>🌐</span>
        <span>{localeLabels[currentLocale]}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 mt-2 min-w-[140px] rounded-lg border bg-white shadow-lg overflow-hidden z-50"
        >
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={hrefFor(l)}
                onClick={() => setOpen(false)}
                className={
                  'block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ' +
                  (l === currentLocale ? 'bg-stella-50 text-stella-800 font-semibold' : '')
                }
                role="option"
                aria-selected={l === currentLocale}
              >
                {localeLabels[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
