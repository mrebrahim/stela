'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Photo = { id: string; public_url: string; is_primary: boolean };

export function PhotoManager({
  listingId, initialPhotos
}: { listingId: string; initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState('');
  const [, start] = useTransition();

  async function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('file', f));
      const res = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? 'Upload failed');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function importFromUrls() {
    const list = urls.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    if (!list.length) return;
    setImporting(true); setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/photos/import-url`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urls: list })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? 'Import failed');
      setUrls('');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  function deletePhoto(id: string) {
    if (!confirm('Delete this photo?')) return;
    start(async () => {
      const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message ?? 'Delete failed'); return; }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <div className="font-semibold text-slate-900">Photos</div>

      {/* CURRENT PHOTOS */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.public_url} alt="" className="w-full h-full object-cover" />
              {p.is_primary && (
                <span className="absolute top-1 left-1 bg-stella-700 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
              )}
              <button
                type="button"
                onClick={() => deletePhoto(p.id)}
                className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-xs hover:bg-red-600 hover:text-white transition"
                aria-label="Delete"
              >✕</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No photos yet.</div>
      )}

      {error && <div className="rounded bg-red-50 border border-red-200 text-red-800 p-2 text-sm">{error}</div>}

      {/* UPLOAD FILES */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Upload files</div>
        <input type="file" multiple accept="image/*" onChange={onFilesPicked} className="block text-sm" />
        {uploading && <div className="text-xs text-slate-500 mt-2">Uploading…</div>}
        <div className="text-xs text-slate-500 mt-2">
          JPG / PNG / WebP / AVIF, max 10 MB each. Files land in <code>/data/uploads</code> on the server.
        </div>
      </div>

      {/* IMPORT FROM URL */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Import from URLs</div>
        <textarea
          rows={3}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={'One URL per line — the server downloads each image and stores it locally.\nhttps://…/photo1.jpg\nhttps://…/photo2.jpg'}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={importFromUrls}
          disabled={importing || !urls.trim()}
          className="mt-2 rounded-md bg-stella-700 text-white px-4 py-1.5 text-sm font-semibold disabled:opacity-40"
        >
          {importing ? 'Downloading…' : 'Import'}
        </button>
      </div>
    </section>
  );
}
