import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/listing-card';
import { GridFilters } from '@/components/grid-filters';
import type { Locale } from '@/i18n/config';
import type { ListingWithProject } from '@/lib/types';

export const revalidate = 60;

type SearchParams = { project?: string; beds?: string; min?: string; max?: string; type?: string; period?: string };

export default async function RentPage({
  params, searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, name_en, name_ar')
    .eq('is_active', true)
    .order('sort_order');

  let q = supabase
    .from('listings')
    .select('*, project:projects(id, slug, name_en, name_ar, area), photos:listing_photos(public_url, storage_path, is_primary)')
    .eq('status', 'published')
    .eq('listing_type', 'rent');

  if (sp.project) {
    const { data: match } = await supabase.from('projects').select('id').eq('slug', sp.project).single();
    if (match) q = q.eq('project_id', match.id);
  }
  if (sp.beds) q = q.eq('bedrooms', Number(sp.beds));
  if (sp.min) q = q.gte('price', Number(sp.min));
  if (sp.max) q = q.lte('price', Number(sp.max));
  if (sp.type) q = q.eq('property_type', sp.type);
  if (sp.period) q = q.eq('rental_period', sp.period);

  const { data: listings } = await q.order('created_at', { ascending: false }).limit(60);
  const list = (listings ?? []) as unknown as ListingWithProject[];
  const projectOpts = (projects ?? []).map((p) => ({ slug: p.slug, name: locale === 'ar' ? p.name_ar : p.name_en }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <GridFilters projects={projectOpts} showRental />
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('rent.title')}</h1>
          <div className="text-sm text-slate-500">{t('rent.results', { count: list.length })}</div>
        </div>
        {list.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-slate-600">{t('rent.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  );
}
