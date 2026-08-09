import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteUpload } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const db = createAdminClient();
  const patch: Record<string, unknown> = {};
  for (const k of [
    'title_en','title_ar','title_ru','title_zh',
    'description_en','description_ar','description_ru','description_zh',
    'locales','price','currency',
    'listing_type','status','property_type','bedrooms','bathrooms','area_sqm','floor',
    'view_kind','beach_distance','finishing','delivery_status','sale_kind','payment_kind',
    'down_payment','rental_period','furnished','max_guests','amenities','video_url',
    'admin_notes','verified','featured','project_id'
  ]) {
    if (k in body) patch[k] = body[k];
  }
  if (body.status === 'published') {
    patch.published_at = new Date().toISOString();
    patch.approved_by = admin.userId;
    patch.approved_at = new Date().toISOString();
  }
  if (body.status === 'rejected' && body.rejected_reason) {
    patch.rejected_reason = body.rejected_reason;
  }
  const { error } = await db.from('listings').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('audit_log').insert({
    actor_id: admin.userId, actor_role: admin.role,
    action: `listing.update`, entity: 'listing', entity_id: id, diff: patch
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = createAdminClient();

  const { data: photos } = await db.from('listing_photos').select('storage_path').eq('listing_id', id);
  for (const p of photos ?? []) {
    if (p.storage_path && !p.storage_path.startsWith('http')) await deleteUpload(p.storage_path);
  }
  const { error } = await db.from('listings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('audit_log').insert({
    actor_id: admin.userId, actor_role: admin.role,
    action: 'listing.delete', entity: 'listing', entity_id: id
  });
  return NextResponse.json({ ok: true });
}
