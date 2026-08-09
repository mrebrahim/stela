import { NextResponse } from 'next/server';
import { readUpload, mimeFromExt } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = (path ?? []).join('/'); // storage layer rejects any traversal
  try {
    const { buf, mtime } = await readUpload(name);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'content-type': mimeFromExt(name),
        'cache-control': 'public, max-age=31536000, immutable',
        'last-modified': mtime.toUTCString()
      }
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
