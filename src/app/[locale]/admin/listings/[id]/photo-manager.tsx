'use client';
import { useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Photo = { id: string; public_url: string; is_primary: boolean };
type Queued = { id: string; file: File; previewUrl: string };

export function PhotoManager({
  listingId, initialPhotos
}: { listingId: string; initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [queued, setQueued] = useState<Queued[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    const additions: Queued[] = images.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setQueued((prev) => [...prev, ...additions]);
    setError(null);
  }

  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    acceptFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  }

  function removeQueued(id: string) {
    setQueued((prev) => {
      const found = prev.find((q) => q.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  }

  function clearQueue() {
    queued.forEach((q) => URL.revokeObjectURL(q.previewUrl));
    setQueued([]);
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    acceptFiles(Array.from(e.dataTransfer.files ?? []));
  }, []);

  async function uploadAll() {
    if (!queued.length) return;
    setUploading(true); setError(null);
    setProgress({ done: 0, total: queued.length });
    try {
      // Chunk uploads in batches of 5 to avoid huge single requests
      // yet still process the whole queue in one operation from the user's POV.
      const BATCH = 5;
      let done = 0;
      for (let i = 0; i < queued.length; i += BATCH) {
        const chunk = queued.slice(i, i + BATCH);
        const fd = new FormData();
        chunk.forEach((q) => fd.append('file', q.file));
        const res = await fetch(`/api/admin/listings/${listingId}/photos`, {
          method: 'POST', body: fd
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? json.error ?? 'Upload failed');
        done += chunk.length;
        setProgress({ done, total: queued.length });
      }
      clearQueue();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 1500);
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
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-900">Photos</div>
        <div className="text-xs text-slate-500">{photos.length} on server</div>
      </div>

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

      {/* BULK UPLOAD — drag & drop */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={
          'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ' +
          (dragActive ? 'border-stella-600 bg-stella-50' : 'border-slate-300 hover:border-stella-400 hover:bg-slate-50')
        }
        role="button"
        tabIndex={0}
      >
        <div className="text-4xl mb-2">📸</div>
        <div className="font-medium text-slate-800">
          {dragActive ? 'Drop photos here' : 'Drag & drop photos here, or click to choose'}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Select many at once with Ctrl+click / Shift+click. JPG · PNG · WebP · AVIF · up to 10 MB each.
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFilesPicked}
          className="hidden"
        />
      </div>

      {/* QUEUE PREVIEW */}
      {queued.length > 0 && (
        <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">
              {queued.length} photo{queued.length === 1 ? '' : 's'} ready to upload
            </div>
            <button
              type="button"
              onClick={clearQueue}
              disabled={uploading}
              className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-40"
            >
              Clear queue
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {queued.map((q) => (
              <div key={q.id} className="relative aspect-square rounded overflow-hidden border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.previewUrl} alt="" className="w-full h-full object-cover" />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeQueued(q.id)}
                    className="absolute top-0.5 right-0.5 bg-white/90 rounded-full w-5 h-5 text-[10px] hover:bg-red-600 hover:text-white transition"
                    aria-label="Remove"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={uploadAll}
              disabled={uploading}
              className="rounded-md bg-stella-700 hover:bg-stella-800 text-white px-5 py-2 text-sm font-semibold disabled:opacity-40"
            >
              {uploading
                ? (progress ? `Uploading ${progress.done}/${progress.total}…` : 'Uploading…')
                : `Upload ${queued.length} photo${queued.length === 1 ? '' : 's'}`}
            </button>
            {progress && (
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-stella-600 transition-all"
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMPORT FROM URL */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Import from URLs (bulk)</div>
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
