import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { LoginForm } from './login-form';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (admin) redirect(`/${locale}/admin`);
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <LoginForm locale={locale} />
    </div>
  );
}
