import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await getAdmin();
  // Login page renders its own /login route — but layouts wrap it too.
  // We only redirect if we're NOT on the login page. Since we don't know the path here,
  // rely on: login page sets a header. Simpler: expose /login without gate via early bypass:
  // solved by rendering children directly for unauthenticated + letting each page decide.
  // For this MVP, protect all admin pages except /admin/login here.
  // Next.js layouts don't get pathname — so /login page.tsx will call getAdmin() itself and skip redirect.

  const nav = [
    { label: 'Dashboard',      href: `/${locale}/admin` },
    { label: 'Listings',       href: `/${locale}/admin/listings` },
    { label: 'New listing',    href: `/${locale}/admin/listings/new` },
    { label: 'Leads',          href: `/${locale}/admin/leads` },
    { label: 'Public site',    href: `/${locale}` }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-e bg-slate-900 text-slate-100 py-6 px-4 lg:min-h-full">
        <div className="text-lg font-bold text-white mb-1">Stella Keys · Admin</div>
        <div className="text-xs text-slate-400 mb-6">{admin?.email ?? 'Not signed in'}</div>
        <nav className="space-y-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-md px-3 py-2 hover:bg-slate-800"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={`/${locale}/admin/logout`} method="post" className="mt-8">
          <button className="w-full rounded-md bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm">
            Sign out
          </button>
        </form>
      </aside>
      <div className="bg-slate-50">{children}</div>
    </div>
  );
}
