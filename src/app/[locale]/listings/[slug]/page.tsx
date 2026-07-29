import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { WhatsappCta } from '@/components/whatsapp-cta';
import { formatPrice } from '@/lib/format';
import { env } from '@/lib/env';
import type { Locale } from '@/i18n/config';
import type { ListingWithProject } from '@/lib/types';

export const revalidate = 120;

export default async function ListingDetailPage({
  params
}: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data } = await supabase
    .from('listings')
    .select('*, project:projects(id, slug, name_en, name_ar, area), photos:listing_photos(public_url, storage_path, is_primary, sort_order)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) notFound();
  const listing = data as unknown as ListingWithProject;

  const projectName = locale === 'ar' ? listing.project.name_ar : listing.project.name_en;
  const title = (locale === 'ar' ? listing.title_ar : listing.title_en) ?? `${listing.property_type} — ${projectName}`;
  const desc = locale === 'ar' ? listing.description_ar : listing.description_en;
  const url = `${env.SITE_URL}/${locale}/listings/${listing.slug}`;

  const jsonLd = listing.listing_type === 'sale'
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: title,
        url,
        datePosted: listing.published_at,
        offers: { '@type': 'Offer', price: listing.price, priceCurrency: listing.currency }
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: title,
        url,
        priceRange: `${listing.currency} ${listing.price}/${listing.rental_period}`
      };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <nav className="text-sm text-slate-500">
            <Link href={`/${locale}`}>{t('brand.name')}</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/projects/${listing.project.slug}`}>{projectName}</Link>
          </nav>

          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden bg-slate-100 aspect-[16/9]">
            {(listing.photos?.length ?? 0) === 0 ? (
              <div className="col-span-4 flex items-center justify-center text-slate-400">
                {listing.property_type}
              </div>
            ) : (
              listing.photos!.slice(0, 4).map((ph, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={ph.public_url ?? ''} alt="" className={i === 0 ? 'col-span-4 md:col-span-3 md:row-span-2 w-full h-full object-cover' : 'w-full h-full object-cover'} />
              ))
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            <div className="mt-1 text-slate-600">
              {projectName} · {t(`filters.areas.${listing.project.area}`)}
              {listing.verified && (
                <span className="ms-2 inline-block bg-stella-600 text-white text-xs px-2 py-0.5 rounded">
                  {t('listing.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4 flex flex-wrap gap-6 text-sm text-slate-700">
            {listing.bedrooms != null && <span>🛏 {t('listing.bedrooms', { n: listing.bedrooms })}</span>}
            {listing.bathrooms != null && <span>🛁 {t('listing.bathrooms', { n: listing.bathrooms })}</span>}
            {listing.area_sqm != null && <span>📐 {t('listing.area', { n: listing.area_sqm })}</span>}
            {listing.floor != null && <span>🏢 {t('listing.floor', { n: listing.floor })}</span>}
            {listing.view_kind && <span>🌊 {listing.view_kind}</span>}
          </div>

          {desc && (
            <section>
              <h2 className="text-lg font-semibold mb-2">{t('listing.sections.description')}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{desc}</p>
            </section>
          )}

          {listing.amenities?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">{t('listing.sections.amenities')}</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-slate-100 text-slate-700 text-sm px-3 py-1">{a.replace(/_/g,' ')}</span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
            {t('listing.sections.verification')} · {t('listing.reference', { ref: listing.reference })}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 h-fit space-y-3 rounded-xl border p-4 bg-white">
          <div className="text-2xl font-bold">
            {formatPrice(listing.price, locale, listing.currency)}
            {listing.listing_type === 'rent' && listing.rental_period && (
              <span className="text-sm text-slate-500 ms-1">/ {t(`filters.rentalPeriods.${listing.rental_period}`)}</span>
            )}
          </div>
          <WhatsappCta reference={listing.reference} url={url} className="w-full" />
          <a
            href={`tel:+${env.WA_NUMBER}`}
            className="w-full inline-flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-slate-50"
          >
            📞 {t('cta.call')}
          </a>
        </aside>
      </div>
    </>
  );
}
