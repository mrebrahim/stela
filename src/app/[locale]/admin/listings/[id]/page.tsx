import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { PhotoManager } from './photo-manager';
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
    .select('id, reference, slug, listing_type, property_type, bedrooms, price, currency, status, locales, video_url, title_en, title_ar, project:projects(name_en, name_ar)')
    .eq('id', id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: photos } = await db
    .from('listing_photos')
    .select('id, public_url, storage_path, sort_order, is_primary')
    .eq('listing_id', id)
    .order('sort_order');

  const project = listing.project as unknown as { name_en: string; name_ar: string } | null;
  const projectName = project ? (locale === 'ar' ? project.name_ar : project.name_en) : '—';
  const title = listing.title_en || listing.title_ar || `${listing.property_type} — ${projectName}`;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <Link href={`/${locale}/admin/listings`} className="text-sm text-slate-500 hover:text-slate-700">← Back to listings</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">{title}</h1>
        <div className="text-sm text-slate-500 mt-1">
          #{listing.reference} · {projectName} · {listing.listing_type} ·{' '}
          <span className={
            'rounded-full px-2 py-0.5 text-xs ' +
            (listing.status === 'published' ? 'bg-emerald-100 text-emerald-800'
              : listing.status === 'pending' ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700')
          }>{listing.status}</span>
        </div>
        <div className="text-sm text-slate-500 mt-1">
          Available in: <strong>{(listing.locales ?? []).join(', ')}</strong>
        </div>
        <Link href={`/${locale}/listings/${listing.slug}`} target="_blank" className="inline-block mt-2 text-sm text-stella-700 hover:underline">
          Preview on public site →
        </Link>
      </div>

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
