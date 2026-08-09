import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);

  const db = createAdminClient();
  const { data: leads } = await db
    .from('leads')
    .select('id, name, phone, message, status, source, created_at, listing:listings(slug, reference)')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Leads</h1>
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>Time</Th><Th>Name</Th><Th>Phone</Th><Th>Message</Th><Th>Listing</Th><Th>Source</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {(leads ?? []).length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No leads yet.</td></tr>}
            {(leads ?? []).map((l) => {
              const listing = l.listing as unknown as { slug: string; reference: string } | null;
              return (
                <tr key={l.id} className="border-t">
                  <Td className="text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</Td>
                  <Td>{l.name}</Td>
                  <Td>{l.phone}</Td>
                  <Td className="max-w-[300px] truncate">{l.message}</Td>
                  <Td>{listing ? <a href={`/${locale}/listings/${listing.slug}`} target="_blank" className="text-stella-700 hover:underline">{listing.reference}</a> : '—'}</Td>
                  <Td>{l.source}</Td>
                  <Td><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{l.status}</span></Td>
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
