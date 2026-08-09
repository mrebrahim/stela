import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { saveUpload } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

  const results = [];
  for (const f of files) {
    try {
      results.push(await saveUpload(f));
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true, files: results });
}
