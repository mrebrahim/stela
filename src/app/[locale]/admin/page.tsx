import Link from 'next/link';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth';
import type { Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  params
}: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);

  const db = createAdminClient();
  const [pending, published, leads] = await Promise.all([
    db.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new')
  ]);

  const stats = [
    { label: 'Pending review',    value: pending.count ?? 0,   href: `/${locale}/admin/listings?status=pending`,   color: 'bg-amber-100 text-amber-800' },
    { label: 'Published',         value: published.count ?? 0, href: `/${locale}/admin/listings?status=published`, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'New leads',         value: leads.count ?? 0,     href: `/${locale}/admin/leads`,                     color: 'bg-stella-100 text-stella-800' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link href={`/${locale}/admin/listings/new`} className="rounded-md bg-stella-700 text-white px-4 py-2 text-sm font-semibold hover:bg-stella-800">
          + New listing
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border bg-white p-5 shadow-card hover:shadow-card-hover transition">
            <div className={'inline-block text-xs font-medium rounded-full px-2 py-0.5 ' + s.color}>{s.label}</div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="font-semibold mb-2">Quick actions</div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/${locale}/admin/listings/new`} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">Create listing</Link>
          <Link href={`/${locale}/admin/listings?status=pending`} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">Review pending</Link>
          <Link href={`/${locale}/admin/leads`} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">See leads</Link>
        </div>
      </div>
    </div>
  );
}
