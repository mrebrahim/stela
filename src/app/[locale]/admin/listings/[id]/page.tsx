import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { PhotoManager } from './photo-manager';
import { ListingForm, type ListingFormInitial } from '../listing-form';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default async function ListingEditPage({
  params
}: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);

  const db = createAdminClient();
  const { data: listing } = await db
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: projects } = await db
    .from('projects')
    .select('id, slug, name_en, name_ar')
    .eq('is_active', true)
    .order('sort_order');

  const { data: photos } = await db
    .from('listing_photos')
    .select('id, public_url, storage_path, sort_order, is_primary')
    .eq('listing_id', id)
    .order('sort_order');

  const initial: ListingFormInitial = {
    id: listing.id,
    project_id: listing.project_id,
    listing_type: listing.listing_type,
    status: listing.status,
    property_type: listing.property_type,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    area_sqm: listing.area_sqm,
    floor: listing.floor,
    view_kind: listing.view_kind,
    price: listing.price,
    finishing: listing.finishing,
    delivery_status: listing.delivery_status,
    rental_period: listing.rental_period,
    furnished: listing.furnished,
    amenities: listing.amenities,
    video_url: listing.video_url,
    featured: listing.featured,
    locales: listing.locales ?? ['ar', 'en'],
    title_ar: listing.title_ar,
    title_en: listing.title_en,
    title_ru: listing.title_ru,
    title_zh: listing.title_zh,
    description_ar: listing.description_ar,
    description_en: listing.description_en,
    description_ru: listing.description_ru,
    description_zh: listing.description_zh
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <Link href={`/${locale}/admin/listings`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to listings
        </Link>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">Edit listing</h1>
          <span className="text-sm text-slate-500">
            #{listing.reference}
          </span>
          <Link
            href={`/${locale}/listings/${listing.slug}`}
            target="_blank"
            className="text-sm text-stella-700 hover:underline"
          >
            Preview on public site →
          </Link>
        </div>
      </div>

      <ListingForm
        locale={locale}
        projects={(projects ?? []).map((p) => ({
          id: p.id,
          name: locale === 'ar' ? p.name_ar : p.name_en
        }))}
        initial={initial}
      />

      <PhotoManager
        listingId={listing.id}
        initialPhotos={(photos ?? []).map((p) => ({
          id: p.id,
          public_url: p.public_url ?? '',
          is_primary: p.is_primary
        }))}
      />
    </div>
  );
}
