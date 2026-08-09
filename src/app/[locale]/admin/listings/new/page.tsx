import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ListingForm } from '../listing-form';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default async function NewListingPage({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);

  const db = createAdminClient();
  const { data: projects } = await db.from('projects').select('id, slug, name_en, name_ar').eq('is_active', true).order('sort_order');

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">New listing</h1>
      <ListingForm
        locale={locale}
        projects={(projects ?? []).map((p) => ({ id: p.id, name: locale === 'ar' ? p.name_ar : p.name_en }))}
      />
    </div>
  );
}
