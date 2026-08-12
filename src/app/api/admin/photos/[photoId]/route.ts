import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteUpload } from '@/lib/storage';

export async function DELETE(_req: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { photoId } = await params;
  const db = createAdminClient();

  const { data: photo } = await db.from('listing_photos').select('id, listing_id, storage_path').eq('id', photoId).maybeSingle();
  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (photo.storage_path && !photo.storage_path.startsWith('http')) {
    await deleteUpload(photo.storage_path);
  }
  const { error } = await db.from('listing_photos').delete().eq('id', photoId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('audit_log').insert({
    actor_id: admin.userId, actor_role: admin.role,
    action: 'photo.delete', entity: 'listing', entity_id: photo.listing_id
  });
  return NextResponse.json({ ok: true });
}
