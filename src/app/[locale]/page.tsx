import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/listing-card';
import type { Locale } from '@/i18n/config';
import type { ListingWithProject, Project } from '@/lib/types';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=2000&q=80&auto=format&fit=crop';

const PROJECT_FALLBACK: Record<string, string> = {
  'stella-heights-sidi-abdel-rahman': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop',
  'stella-sidi-abdel-rahman':         'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80&auto=format&fit=crop',
  'stella-marina':                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80&auto=format&fit=crop',
  'stella-di-mare-1':                 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80&auto=format&fit=crop',
  'stella-di-mare-2':                 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80&auto=format&fit=crop'
};

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, slug, name_en, name_ar, area, description_en, description_ar, hero_image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  const projects = (projectsRaw ?? []) as Pick<Project, 'id' | 'slug' | 'name_en' | 'name_ar' | 'area' | 'hero_image_url'>[];

  const ids = projects.map((p) => p.id);
  const { data: countsRaw } = await supabase
    .from('listings')
    .select('project_id')
    .eq('status', 'published')
    .contains('locales', [locale])
    .in('project_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const countByProject = new Map<string, number>();
  (countsRaw ?? []).forEach((row: { project_id: string }) => {
    countByProject.set(row.project_id, (countByProject.get(row.project_id) ?? 0) + 1);
  });

  const { data: featuredRaw } = await supabase
    .from('listings')
    .select('*, project:projects(id, slug, name_en, name_ar, area), photos:listing_photos(public_url, storage_path, is_primary)')
    .eq('status', 'published')
    .contains('locales', [locale])
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);
  const featured = (featuredRaw ?? []) as unknown as ListingWithProject[];

  const trustBadges = [t('home.trust1'), t('home.trust2'), t('home.trust3'), t('home.trust4')];

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover -z-10"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-hero-fade -z-10" />

        <div className="max-w-6xl mx-auto px-4 pt-24 pb-32 md:pt-32 md:pb-44 text-white">
          <div className="fade-up max-w-3xl">
            <div className="text-sm uppercase tracking-[0.25em] text-sand-200/90 mb-4">
              {t('home.eyebrow')}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] whitespace-pre-line">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              {t('home.heroSub')}
            </p>

            {/* CTA pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/buy`}
                className="bg-white text-stella-800 rounded-lg px-6 py-3 font-semibold hover:bg-sand-50 hover:shadow-card-hover transition"
              >
                {t('cta.buy')} →
              </Link>
              <Link
                href={`/${locale}/rent`}
                className="bg-white/10 backdrop-blur border border-white/40 text-white rounded-lg px-6 py-3 font-semibold hover:bg-white/20 transition"
              >
                {t('cta.rent')}
              </Link>
              <Link
                href={`/${locale}/list-your-unit`}
                className="bg-sand-500 text-white rounded-lg px-6 py-3 font-semibold hover:bg-sand-600 transition"
              >
                {t('cta.listYourUnit')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {trustBadges.map((b) => (
                <span key={b} className="inline-flex items-center gap-2">
                  <span className="text-sand-300">✓</span> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PROJECTS ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-20">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold section-title">{t('home.projectsTitle')}</h2>
            <p className="text-slate-500 mt-4 max-w-xl">{t('home.projectsSub')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => {
            const count = countByProject.get(p.id) ?? 0;
            const name = locale === 'ar' ? p.name_ar : p.name_en;
            const bg = p.hero_image_url ?? PROJECT_FALLBACK[p.slug];
            const big = i === 0; // first card spans wider on desktop
            return (
              <Link
                key={p.id}
                href={`/${locale}/projects/${p.slug}`}
                className={
                  'group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition ' +
                  (big ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/5]')
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bg}
                  alt={name}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stella-950/85 via-stella-950/30 to-transparent" />
                <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end text-white">
                  <div className="text-xs uppercase tracking-widest text-sand-200 mb-1">
                    {t(`filters.areas.${p.area}`)}
                  </div>
                  <div className="text-xl md:text-2xl font-bold leading-snug">{name}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-white/85">
                      {t('home.unitsAvailable', { count })}
                    </span>
                    <span className="rounded-full bg-white/15 backdrop-blur border border-white/30 text-xs px-3 py-1 group-hover:bg-white group-hover:text-stella-800 transition">
                      {t('cta.viewProject')} →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════ FEATURED LISTINGS ═══════════ */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-20">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold section-title">{t('home.featuredTitle')}</h2>
              <p className="text-slate-500 mt-4 max-w-xl">{t('home.featuredSub')}</p>
            </div>
            <Link href={`/${locale}/buy`} className="text-stella-700 hover:text-stella-900 font-medium">
              {t('cta.buy')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold section-title inline-block">{t('home.stepsTitle')}</h2>
          <p className="text-slate-500 mt-4">{t('home.stepsSub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🔎', title: t('home.step1Title'), body: t('home.step1Body') },
            { icon: '💬', title: t('home.step2Title'), body: t('home.step2Body') },
            { icon: '🔑', title: t('home.step3Title'), body: t('home.step3Body') }
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-white p-6 shadow-card hover:shadow-card-hover transition">
              <div className="w-12 h-12 rounded-xl bg-stella-50 text-stella-700 flex items-center justify-center text-2xl mb-4">
                {s.icon}
              </div>
              <div className="font-semibold text-lg text-slate-900">{s.title}</div>
              <p className="text-slate-600 mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ OWNER CTA ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 mt-20 mb-16">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=80&auto=format&fit=crop"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stella-900/90 via-stella-800/80 to-stella-700/60" />
          <div className="relative p-8 md:p-14 text-white">
            <h3 className="text-2xl md:text-4xl font-extrabold max-w-2xl leading-tight">{t('home.ctaTitle')}</h3>
            <p className="mt-4 text-white/85 max-w-xl">{t('home.ctaSub')}</p>
            <Link
              href={`/${locale}/list-your-unit`}
              className="inline-block mt-6 bg-sand-500 hover:bg-sand-600 text-white rounded-lg px-6 py-3 font-semibold transition"
            >
              {t('cta.listYourUnit')} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
