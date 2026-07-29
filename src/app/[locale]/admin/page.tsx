import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHome({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  // Read pending queue — RLS allows only admin users.
  const { data: pending, error } = await supabase
    .from('listings')
    .select('id, reference, slug, listing_type, property_type, bedrooms, price, created_at, project:projects(name_en, name_ar)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t('admin.queue')}</h1>
      <p className="text-sm text-slate-500 mt-1">
        Sign in as a user in <code>admin_users</code> to see pending listings.
      </p>

      <div className="mt-6 rounded-xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-start">
            <tr>
              <Th>Ref</Th>
              <Th>Type</Th>
              <Th>Project</Th>
              <Th>Beds</Th>
              <Th>Price</Th>
              <Th>Submitted</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={7} className="p-4 text-red-700">{error.message}</td></tr>
            )}
            {(pending ?? []).length === 0 && !error && (
              <tr><td colSpan={7} className="p-6 text-center text-slate-500">No pending submissions.</td></tr>
            )}
            {(pending ?? []).map((l) => {
              const proj = (l.project as unknown as { name_en: string; name_ar: string } | null);
              return (
                <tr key={l.id} className="border-t">
                  <Td>{l.reference}</Td>
                  <Td>{l.listing_type}</Td>
                  <Td>{proj ? (locale === 'ar' ? proj.name_ar : proj.name_en) : ''}</Td>
                  <Td>{l.bedrooms}</Td>
                  <Td>{l.price}</Td>
                  <Td>{new Date(l.created_at).toLocaleDateString()}</Td>
                  <Td><Link href={`/${locale}/listings/${l.slug}`} className="text-stella-700">preview</Link></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-start px-3 py-2 font-medium text-slate-500">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
