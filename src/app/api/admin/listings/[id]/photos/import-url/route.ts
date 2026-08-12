import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveUpload } from '@/lib/storage';

export const runtime = 'nodejs';

// POST — fetch remote image URLs, save them to /data/uploads, attach to listing.
// Body: { urls: string[] }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  let body: { urls?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const urls = (body.urls ?? []).filter((u) => typeof u === 'string');
  if (!urls.length) return NextResponse.json({ error: 'urls[] is required' }, { status: 400 });

  const db = createAdminClient();
  const { data: listing } = await db.from('listings').select('id').eq('id', id).maybeSingle();
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const { data: existing } = await db.from('listing_photos').select('id').eq('listing_id', id);
  const currentCount = (existing ?? []).length;

  const saved = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'stellaresale-import/1.0' } });
      if (!res.ok) throw new Error(`Fetch ${res.status} for ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const type = res.headers.get('content-type')?.split(';')[0].trim() || 'image/jpeg';
      const filename = url.split('/').pop()?.split('?')[0] || `image-${i}.jpg`;
      const file = new File([new Uint8Array(buf)], filename, { type });
      const s = await saveUpload(file);
      saved.push({
        listing_id: id,
        storage_path: s.storage_path,
        public_url: s.public_url,
        sort_order: currentCount + i,
        is_primary: currentCount === 0 && i === 0
      });
    } catch (e) {
      return NextResponse.json({ error: `Failed on ${url}: ${(e as Error).message}` }, { status: 400 });
    }
  }
  const { error } = await db.from('listing_photos').insert(saved);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('audit_log').insert({
    actor_id: admin.userId, actor_role: admin.role,
    action: 'listing.photos.import', entity: 'listing', entity_id: id,
    diff: { imported: saved.length }
  });
  return NextResponse.json({ ok: true, count: saved.length });
}
