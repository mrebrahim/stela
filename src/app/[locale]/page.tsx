import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/types';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name_en, name_ar, area, description_en, description_ar, hero_image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const ids = (projects ?? []).map((p) => p.id);
  const { data: counts } = await supabase
    .from('listings')
    .select('project_id')
    .eq('status', 'published')
    .in('project_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const countByProject = new Map<string, number>();
  (counts ?? []).forEach((row: { project_id: string }) => {
    countByProject.set(row.project_id, (countByProject.get(row.project_id) ?? 0) + 1);
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stella-900 via-stella-700 to-stella-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">{t('home.heroTitle')}</h1>
          <p className="mt-4 text-lg text-stella-50/90 max-w-2xl">{t('home.heroSub')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/buy`} className="bg-white text-stella-700 rounded-lg px-5 py-3 font-semibold hover:bg-slate-100">
              {t('cta.buy')}
            </Link>
            <Link href={`/${locale}/rent`} className="bg-white/10 border border-white/40 text-white rounded-lg px-5 py-3 font-semibold hover:bg-white/20">
              {t('cta.rent')}
            </Link>
            <Link href={`/${locale}/list-your-unit`} className="bg-sand-500 text-white rounded-lg px-5 py-3 font-semibold hover:bg-sand-700">
              {t('cta.listYourUnit')}
            </Link>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('home.projectsTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects ?? []).map((p) => {
            const project = p as Pick<Project, 'id' | 'slug' | 'name_en' | 'name_ar' | 'area'>;
            const count = countByProject.get(project.id) ?? 0;
            const name = locale === 'ar' ? project.name_ar : project.name_en;
            return (
              <Link
                key={project.id}
                href={`/${locale}/projects/${project.slug}`}
                className="rounded-xl border overflow-hidden hover:shadow-md transition bg-white"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-stella-100 to-sand-200 flex items-center justify-center text-stella-700 text-lg font-semibold">
                  {name}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-slate-900">{name}</div>
                  <div className="text-sm text-slate-500">
                    {t(`filters.areas.${project.area}`)}
                  </div>
                  <div className="mt-2 text-sm text-stella-700">
                    {t('home.unitsAvailable', { count })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-xl bg-sand-50 border border-sand-200 p-6 md:p-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="text-3xl">🛡️</div>
          <div>
            <div className="font-semibold text-lg">{t('home.trustTitle')}</div>
            <div className="text-slate-700 mt-1">{t('home.trustBody')}</div>
          </div>
        </div>
      </section>
    </>
  );
}
