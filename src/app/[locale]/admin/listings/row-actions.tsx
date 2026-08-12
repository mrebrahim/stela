'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { Locale } from '@/i18n/config';

export function RowActions({
  id, slug, status, locale
}: { id: string; slug: string; status: string; locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function patch(patchBody: Record<string, unknown>) {
    start(async () => {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patchBody)
      });
      if (!res.ok) alert((await res.json()).error?.message ?? 'Failed');
      else router.refresh();
    });
  }
  function remove() {
    if (!confirm('Delete this listing?')) return;
    start(async () => {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      if (!res.ok) alert((await res.json()).error?.message ?? 'Failed');
      else router.refresh();
    });
  }

  return (
    <div className="flex gap-1.5">
      <Link href={`/${locale}/admin/listings/${id}`} className="rounded bg-stella-700 text-white px-2 py-1 text-xs hover:bg-stella-800">Edit</Link>
      <Link href={`/${locale}/listings/${slug}`} target="_blank" className="rounded border px-2 py-1 text-xs hover:bg-slate-50">Preview</Link>
      {status === 'pending' && (
        <>
          <button disabled={pending} onClick={() => patch({ status: 'published', verified: true })} className="rounded bg-emerald-600 text-white px-2 py-1 text-xs disabled:opacity-40">Approve</button>
          <button disabled={pending} onClick={() => patch({ status: 'rejected', rejected_reason: 'Not eligible' })} className="rounded bg-red-600 text-white px-2 py-1 text-xs disabled:opacity-40">Reject</button>
        </>
      )}
      {status === 'published' && (
        <button disabled={pending} onClick={() => patch({ status: 'archived' })} className="rounded border px-2 py-1 text-xs hover:bg-slate-50">Archive</button>
      )}
      <button disabled={pending} onClick={remove} className="rounded border border-red-200 text-red-700 px-2 py-1 text-xs hover:bg-red-50">Delete</button>
    </div>
  );
}
