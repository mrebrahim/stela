import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatPrice } from '@/lib/format';
import type { ListingWithProject } from '@/lib/types';

const FALLBACKS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&auto=format&fit=crop'
];

function fallbackFor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 997;
  return FALLBACKS[sum % FALLBACKS.length];
}

export async function ListingCard({ listing }: { listing: ListingWithProject }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const isRent = listing.listing_type === 'rent';
  const projectName = locale === 'ar' ? listing.project.name_ar : listing.project.name_en;
  const title = (locale === 'ar' ? listing.title_ar : listing.title_en) ?? `${listing.property_type} — ${projectName}`;
  const cover = listing.photos?.[0]?.public_url ?? fallbackFor(listing.id);

  return (
    <Link
      href={`/${locale}/listings/${listing.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition"
    >
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {listing.verified && (
          <span className="absolute top-3 start-3 bg-stella-700 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow">
            ✓ {t('listing.verified')}
          </span>
        )}
        <span className="absolute bottom-3 end-3 bg-white/95 text-slate-800 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
          {listing.listing_type === 'sale' ? t('nav.buy') : t('nav.rent')}
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        <div className="text-lg font-bold text-slate-900 flex items-baseline gap-2">
          <span>{formatPrice(listing.price, locale as 'ar' | 'en', listing.currency)}</span>
          {isRent && listing.rental_period && (
            <span className="text-sm font-normal text-slate-500">
              / {t(`filters.rentalPeriods.${listing.rental_period}`)}
            </span>
          )}
        </div>
        <div className="text-sm text-slate-700 truncate">{title}</div>
        <div className="text-xs text-slate-500 flex gap-3 pt-1">
          {listing.bedrooms != null && <span>🛏 {t('listing.bedrooms', { n: listing.bedrooms })}</span>}
          {listing.bathrooms != null && <span>🛁 {t('listing.bathrooms', { n: listing.bathrooms })}</span>}
          {listing.area_sqm != null && <span>📐 {t('listing.area', { n: listing.area_sqm })}</span>}
        </div>
      </div>
    </Link>
  );
}
