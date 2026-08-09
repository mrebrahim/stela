import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Runtime destination for uploaded property photos.
// In prod, Coolify mounts a persistent volume at /data/uploads.
// Locally, defaults to <repo>/.uploads (gitignored) so dev works.
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(process.cwd(), '.uploads');

async function ensureDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

// Basic MIME → extension map, whitelist for uploaded images.
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
};

export function isAllowedMime(mime: string) {
  return mime in EXT;
}

export async function saveUpload(file: File) {
  if (!isAllowedMime(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10 MB)');
  }
  await ensureDir();
  const ext = EXT[file.type];
  const id = crypto.randomBytes(12).toString('hex');
  const filename = `${Date.now()}-${id}.${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf, { mode: 0o644 });
  return {
    filename,
    storage_path: filename,
    public_url: `/api/media/${filename}`,
    bytes: buf.byteLength,
    mime: file.type
  };
}

export async function readUpload(name: string) {
  // Basic path-traversal guard: name must be a single segment.
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    throw new Error('Invalid filename');
  }
  const full = path.join(UPLOADS_DIR, name);
  const stat = await fs.stat(full);
  const buf = await fs.readFile(full);
  return { buf, size: stat.size, mtime: stat.mtime };
}

export async function deleteUpload(name: string) {
  if (name.includes('/') || name.includes('\\') || name.includes('..')) return;
  try { await fs.unlink(path.join(UPLOADS_DIR, name)); } catch { /* noop */ }
}

export function mimeFromExt(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    default:     return 'application/octet-stream';
  }
}
