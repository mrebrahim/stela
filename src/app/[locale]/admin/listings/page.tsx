import Link from 'next/link';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Locale } from '@/i18n/config';
import { RowActions } from './row-actions';

export const dynamic = 'force-dynamic';

const STATUSES = ['draft','pending','verified','published','rejected','archived'] as const;
type Status = typeof STATUSES[number];

export default async function AdminListingsIndex({
  params, searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);

  const db = createAdminClient();
  let q = db.from('listings').select('id, slug, reference, listing_type, property_type, bedrooms, price, currency, status, verified, featured, created_at, project:projects(name_en, name_ar)').order('created_at', { ascending: false }).limit(200);
  if (status && (STATUSES as readonly string[]).includes(status)) q = q.eq('status', status as Status);
  const { data: listings } = await q;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
        <Link href={`/${locale}/admin/listings/new`} className="rounded-md bg-stella-700 text-white px-4 py-2 text-sm font-semibold hover:bg-stella-800">
          + New listing
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <Link href={`/${locale}/admin/listings`} className={'rounded-full border px-3 py-1 ' + (!status ? 'bg-slate-900 text-white' : 'bg-white')}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/${locale}/admin/listings?status=${s}`} className={'rounded-full border px-3 py-1 capitalize ' + (status === s ? 'bg-slate-900 text-white' : 'bg-white')}>
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-start">
              <Th>Ref</Th><Th>Type</Th><Th>Project</Th><Th>Beds</Th><Th>Price</Th><Th>Status</Th><Th>Created</Th><Th /></tr>
          </thead>
          <tbody>
            {(listings ?? []).length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-500">No listings.</td></tr>
            )}
            {(listings ?? []).map((l) => {
              const p = l.project as unknown as { name_en: string; name_ar: string } | null;
              return (
                <tr key={l.id} className="border-t">
                  <Td>{l.reference}</Td>
                  <Td className="capitalize">{l.listing_type}</Td>
                  <Td className="truncate max-w-[220px]">{p ? (locale === 'ar' ? p.name_ar : p.name_en) : ''}</Td>
                  <Td>{l.bedrooms}</Td>
                  <Td>{l.price?.toLocaleString()} {l.currency}</Td>
                  <Td>
                    <span className={
                      'rounded-full px-2 py-0.5 text-xs ' +
                      (l.status === 'published' ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'pending' ? 'bg-amber-100 text-amber-800'
                        : l.status === 'rejected' ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700')
                    }>{l.status}</span>
                  </Td>
                  <Td className="text-slate-500">{new Date(l.created_at).toLocaleDateString()}</Td>
                  <Td className="whitespace-nowrap">
                    <RowActions id={l.id} slug={l.slug} status={l.status} locale={locale} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) { return <th className="text-start px-3 py-2 font-medium text-slate-500">{children}</th>; }
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) { return <td className={'px-3 py-2 ' + className}>{children}</td>; }
