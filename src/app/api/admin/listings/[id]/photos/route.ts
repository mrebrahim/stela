import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveUpload } from '@/lib/storage';

export const runtime = 'nodejs';

// POST — add one or more photos to a listing (multipart, admin-only).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const db = createAdminClient();
  const { data: listing } = await db.from('listings').select('id').eq('id', id).maybeSingle();
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

  // How many photos are already attached — new ones get higher sort_order
  const { data: existing } = await db.from('listing_photos').select('id').eq('listing_id', id);
  const currentCount = (existing ?? []).length;

  const saved = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const s = await saveUpload(f);
      saved.push({
        listing_id: id,
        storage_path: s.storage_path,
        public_url: s.public_url,
        sort_order: currentCount + i,
        is_primary: currentCount === 0 && i === 0
      });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }
  const { error } = await db.from('listing_photos').insert(saved);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('audit_log').insert({
    actor_id: admin.userId, actor_role: admin.role,
    action: 'listing.photos.add', entity: 'listing', entity_id: id,
    diff: { added: saved.length }
  });
  return NextResponse.json({ ok: true, count: saved.length });
}
