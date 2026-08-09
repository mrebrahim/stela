import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import { ListingCard } from '@/components/listing-card';
import type { Locale } from '@/i18n/config';
import type { ListingWithProject, Project } from '@/lib/types';

export const revalidate = 300;

export async function generateStaticParams() {
  const { locales } = await import('@/i18n/config');
  const supabase = createPublicClient();
  const { data } = await supabase.from('projects').select('slug').eq('is_active', true);
  return (data ?? []).flatMap((p) => locales.map((locale) => ({ locale, slug: p.slug })));
}

export default async function ProjectHubPage({
  params
}: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: project } = await supabase.from('projects').select('*').eq('slug', slug).single();
  if (!project) notFound();
  const p = project as Project;

  const { data: listings } = await supabase
    .from('listings')
    .select('*, project:projects(id, slug, name_en, name_ar, area), photos:listing_photos(public_url, storage_path, is_primary)')
    .eq('status', 'published')
    .eq('project_id', p.id)
    .contains('locales', [locale])
    .order('featured', { ascending: false })
    .limit(12);

  const list = (listings ?? []) as unknown as ListingWithProject[];
  const name = locale === 'ar' ? p.name_ar : p.name_en;
  const description = locale === 'ar' ? p.description_ar : p.description_en;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    address: { '@type': 'PostalAddress', addressCountry: 'EG', addressLocality: p.area === 'north_coast' ? 'North Coast' : 'Ain Sokhna' }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-gradient-to-br from-stella-800 to-stella-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-sm text-stella-100/80 uppercase tracking-wide">{t(`filters.areas.${p.area}`)}</div>
          <h1 className="text-3xl md:text-5xl font-bold mt-1">{name}</h1>
          {p.developer && <div className="mt-2 text-stella-100">{p.developer}</div>}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {description && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('nav.about')}</h2>
            <p className="text-slate-700 leading-relaxed max-w-3xl">{description}</p>
          </section>
        )}

        {p.amenities?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('filters.amenities')}</h2>
            <div className="flex flex-wrap gap-2">
              {p.amenities.map((a) => (
                <span key={a} className="rounded-full bg-slate-100 text-slate-700 text-sm px-3 py-1">{a.replace(/_/g,' ')}</span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('nav.buy')} / {t('nav.rent')}</h2>
            <Link href={`/${locale}/buy?project=${p.slug}`} className="text-stella-700 hover:underline text-sm">
              {t('cta.viewProject')} →
            </Link>
          </div>
          {list.length === 0 ? (
            <div className="rounded-xl border p-8 text-center text-slate-600">{t('buy.empty')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
