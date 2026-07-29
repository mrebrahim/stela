import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose">
      <h1>About Stella Keys</h1>
      <p>The trusted destination for Stella-resort inventory in Egypt.</p>
    </div>
  );
}
