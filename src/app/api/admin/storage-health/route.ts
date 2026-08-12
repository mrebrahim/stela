import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { getAdmin } from '@/lib/auth';
import { UPLOADS_DIR } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let exists = false, writable = false, fileCount = 0, sampleFiles: string[] = [];
  let mountInfo: string | null = null;
  let error: string | null = null;

  try {
    const stat = await fs.stat(UPLOADS_DIR);
    exists = stat.isDirectory();
    try {
      const files = await fs.readdir(UPLOADS_DIR);
      fileCount = files.length;
      sampleFiles = files.slice(0, 5);
    } catch (e) { error = 'readdir: ' + (e as Error).message; }
    try {
      const probe = `${UPLOADS_DIR}/.probe-${Date.now()}`;
      await fs.writeFile(probe, 'ok');
      await fs.unlink(probe);
      writable = true;
    } catch (e) { error = (error ?? '') + ' write: ' + (e as Error).message; }
  } catch (e) {
    error = 'stat: ' + (e as Error).message;
  }

  // Check /proc/mounts to see if /data is a mount point (volume mounted)
  try {
    const mounts = await fs.readFile('/proc/mounts', 'utf8');
    const dataLines = mounts.split('\n').filter((l) => l.includes(' /data ') || l.includes(' /data/'));
    mountInfo = dataLines.join('\n') || '/data is NOT a mount point (uses container filesystem — files vanish on redeploy)';
  } catch { /* not on linux, skip */ }

  return NextResponse.json({
    uploads_dir: UPLOADS_DIR,
    exists, writable, file_count: fileCount, sample: sampleFiles,
    mount_info: mountInfo,
    error
  });
}
