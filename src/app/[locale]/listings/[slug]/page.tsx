import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { InquiryForm } from '@/components/inquiry-form';
import { formatPrice } from '@/lib/format';
import { env } from '@/lib/env';
import { youtubeIdFrom, youtubeEmbedUrl } from '@/lib/youtube';
import { localizedTitle, localizedDescription } from '@/lib/localized';
import { PropertyInfoTable } from '@/components/property-info-table';
import { AmenitiesGrid } from '@/components/amenities-grid';
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
  const ytId = youtubeIdFrom(listing.video_url);

  const projectName = locale === 'ar' ? listing.project.name_ar : listing.project.name_en;
  const title = localizedTitle(listing, locale) ?? `${listing.property_type} — ${projectName}`;
  const desc = localizedDescription(listing, locale);
  const url = `${env.SITE_URL}/${locale}/listings/${listing.slug}`;

  // Sort photos by is_primary then sort_order
  const sortedPhotos = (listing.photos ?? []).slice().sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

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

  const galleryImages = sortedPhotos.slice(0, 5);
  const hasPhotos = galleryImages.length > 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4">
          <Link href={`/${locale}`} className="hover:text-slate-700">{t('brand.name')}</Link>
          <span className="mx-2">›</span>
          <Link href={`/${locale}/projects/${listing.project.slug}`} className="hover:text-slate-700">{projectName}</Link>
        </nav>

        {/* GALLERY — hero photo + up to 4 thumbs, magazine style */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 mb-8">
          {hasPhotos ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[280px] sm:h-[380px] md:h-[480px]">
              {/* main image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImages[0].public_url ?? ''}
                alt={title}
                className="col-span-4 md:col-span-3 row-span-2 w-full h-full object-cover"
              />
              {/* small thumbs */}
              {galleryImages.slice(1, 5).map((ph, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={ph.public_url ?? ''}
                  alt=""
                  loading="lazy"
                  className="hidden md:block w-full h-full object-cover"
                />
              ))}
              {sortedPhotos.length > 5 && (
                <div className="hidden md:flex absolute bottom-3 end-3 items-center gap-1 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur">
                  <span>📷</span> {sortedPhotos.length}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] flex items-center justify-center text-slate-400 text-sm">
              {listing.property_type}
            </div>
          )}
        </div>

        {/* CONTENT + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-8">
            {/* TITLE + AREA */}
            <div>
              <div className="text-sm text-slate-500 mb-1">
                {projectName} · {t(`filters.areas.${listing.project.area}`)}
                {listing.verified && (
                  <span className="ms-2 inline-block bg-stella-700 text-white text-xs px-2 py-0.5 rounded-full">
                    ✓ {t('listing.verified')}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{title}</h1>
              <div className="mt-3 text-3xl md:text-4xl font-extrabold text-stella-800">
                {formatPrice(listing.price, locale, listing.currency)}
                {listing.listing_type === 'rent' && listing.rental_period && (
                  <span className="text-base font-normal text-slate-500 ms-2">/ {t(`filters.rentalPeriods.${listing.rental_period}`)}</span>
                )}
              </div>
            </div>

            {/* KEY FACTS STRIP */}
            <div className="rounded-2xl border bg-white p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {listing.bedrooms != null && (
                <Fact icon="🛏" label={locale === 'ar' ? 'غرف' : locale === 'ru' ? 'Спальни' : locale === 'zh' ? '卧室' : 'Beds'} value={String(listing.bedrooms)} />
              )}
              {listing.bathrooms != null && (
                <Fact icon="🛁" label={locale === 'ar' ? 'حمامات' : locale === 'ru' ? 'Санузлы' : locale === 'zh' ? '浴室' : 'Baths'} value={String(listing.bathrooms)} />
              )}
              {listing.area_sqm != null && (
                <Fact icon="📐" label={locale === 'ar' ? 'مساحة' : locale === 'ru' ? 'Площадь' : locale === 'zh' ? '面积' : 'Area'} value={`${listing.area_sqm} ${locale === 'ar' ? 'م²' : locale === 'zh' ? '㎡' : 'sqm'}`} />
              )}
              {listing.floor != null && (
                <Fact icon="🏢" label={locale === 'ar' ? 'الدور' : locale === 'ru' ? 'Этаж' : locale === 'zh' ? '楼层' : 'Floor'} value={String(listing.floor)} />
              )}
            </div>

            {/* VIDEO */}
            {ytId && (
              <section>
                <h2 className="text-xl font-bold mb-4 section-title inline-block">
                  {locale === 'ar' ? 'فيديو الوحدة' : locale === 'ru' ? 'Видео объекта' : locale === 'zh' ? '房产视频' : 'Property video'}
                </h2>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mt-4">
                  <iframe
                    src={youtubeEmbedUrl(ytId)}
                    title="Property video"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            {desc && (
              <section>
                <h2 className="text-xl font-bold mb-4 section-title inline-block">{t('listing.sections.description')}</h2>
                <div className="rounded-2xl border bg-white p-6 shadow-card mt-4">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              </section>
            )}

            {/* PROPERTY INFO TABLE */}
            <PropertyInfoTable
              reference={listing.reference}
              propertyType={listing.property_type}
              listingType={listing.listing_type}
              deliveryStatus={listing.delivery_status}
              saleKind={listing.sale_kind}
              paymentKind={listing.payment_kind}
              rentalPeriod={listing.rental_period}
              furnished={listing.furnished}
              bedrooms={listing.bedrooms}
              bathrooms={listing.bathrooms}
              areaSqm={listing.area_sqm}
              floor={listing.floor}
              viewKind={listing.view_kind}
              beachDistance={listing.beach_distance}
              publishedAt={listing.published_at}
            />

            {/* AMENITIES */}
            {listing.amenities?.length > 0 && (
              <AmenitiesGrid slugs={listing.amenities} />
            )}

            {/* VERIFICATION BLOCK */}
            <section className="rounded-2xl border bg-stella-50 border-stella-100 p-5 flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="font-semibold text-stella-800">{t('listing.sections.verification')}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {t('listing.reference', { ref: listing.reference })}
                </div>
              </div>
            </section>
          </div>

          {/* STICKY SIDEBAR */}
          <aside className="lg:sticky lg:top-20 h-fit space-y-4 rounded-2xl border bg-white p-5 shadow-card">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {locale === 'ar' ? 'السعر' : locale === 'ru' ? 'Цена' : locale === 'zh' ? '价格' : 'Price'}
              </div>
              <div className="text-2xl font-extrabold text-stella-800 mt-1">
                {formatPrice(listing.price, locale, listing.currency)}
                {listing.listing_type === 'rent' && listing.rental_period && (
                  <span className="text-sm font-normal text-slate-500 ms-1">/ {t(`filters.rentalPeriods.${listing.rental_period}`)}</span>
                )}
              </div>
            </div>
            <InquiryForm
              listingId={listing.id}
              reference={listing.reference}
              projectId={listing.project.id}
            />
            <div className="text-xs text-slate-500 text-center pt-2 border-t">
              {t('listing.reference', { ref: listing.reference })}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-lg bg-stella-50 text-stella-700 flex items-center justify-center text-lg" aria-hidden>{icon}</span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
