import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { SubmissionForm } from './submission-form';
import type { Locale } from '@/i18n/config';

export default async function ListYourUnitPage({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name_en, name_ar')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <SubmissionForm locale={locale} projects={(projects ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: locale === 'ar' ? p.name_ar : p.name_en
      }))} />
    </div>
  );
}
