import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatPrice } from '@/lib/format';
import type { ListingWithProject } from '@/lib/types';

export async function ListingCard({ listing }: { listing: ListingWithProject }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const isRent = listing.listing_type === 'rent';
  const projectName = locale === 'ar' ? listing.project.name_ar : listing.project.name_en;
  const title = (locale === 'ar' ? listing.title_ar : listing.title_en) ?? `${listing.property_type} — ${projectName}`;
  const cover = listing.photos?.[0]?.public_url;

  return (
    <Link
      href={`/${locale}/listings/${listing.slug}`}
      className="group block rounded-xl border overflow-hidden bg-white hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-slate-100 relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            {listing.property_type}
          </div>
        )}
        {listing.verified && (
          <span className="absolute top-2 start-2 bg-stella-600 text-white text-xs px-2 py-0.5 rounded">
            {t('listing.verified')}
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="font-semibold text-slate-900 truncate">
          {formatPrice(listing.price, locale as 'ar' | 'en', listing.currency)}
          {isRent && listing.rental_period ? (
            <span className="text-sm text-slate-500 ms-1">/ {t(`filters.rentalPeriods.${listing.rental_period}`)}</span>
          ) : null}
        </div>
        <div className="text-sm text-slate-600 truncate">{title}</div>
        <div className="text-xs text-slate-500 flex gap-3">
          {listing.bedrooms != null && <span>{t('listing.bedrooms', { n: listing.bedrooms })}</span>}
          {listing.bathrooms != null && <span>{t('listing.bathrooms', { n: listing.bathrooms })}</span>}
          {listing.area_sqm != null && <span>{t('listing.area', { n: listing.area_sqm })}</span>}
        </div>
      </div>
    </Link>
  );
}
