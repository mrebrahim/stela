import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="text-slate-600 mt-2">Reach us on WhatsApp — link in the header.</p>
    </div>
  );
}
