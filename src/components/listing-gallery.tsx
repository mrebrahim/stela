'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type Photo = { public_url: string | null };

export function ListingGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const usable = photos.filter((p) => !!p.public_url);
  const total = usable.length;

  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const next  = useCallback(() => setIndex((i) => (i == null ? null : (i + 1) % total)), [total]);
  const prev  = useCallback(() => setIndex((i) => (i == null ? null : (i - 1 + total) % total)), [total]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft')  prev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, next, prev]);

  // Touch swipe support in the lightbox
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  }

  // Placeholder when no photos
  if (total === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[16/9] flex items-center justify-center text-slate-400">
        No photos yet
      </div>
    );
  }

  // Bayut-style 5-tile grid: hero on the left, 4 thumbs in a 2×2 on the right.
  const hero = usable[0];
  const thumbs = usable.slice(1, 5);

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden bg-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] sm:h-[420px] md:h-[500px]">
          {/* HERO */}
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="relative md:col-span-2 md:row-span-2 group overflow-hidden"
            aria-label="Open photo 1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.public_url!}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
            />
          </button>

          {/* 4 SIDE THUMBS (desktop only) */}
          {thumbs.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i + 1)}
              className="relative hidden md:block group overflow-hidden"
              aria-label={`Open photo ${i + 2}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.public_url!}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
              />
            </button>
          ))}
        </div>

        {/* "N photos" badge — opens the lightbox */}
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 text-sm font-semibold px-3.5 py-2 rounded-full shadow-card backdrop-blur"
        >
          <span aria-hidden>📷</span> {total} photos
        </button>
      </div>

      {/* LIGHTBOX */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
        >
          {/* TOP BAR */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm tabular-nums bg-white/10 rounded-full px-3 py-1">
              {index! + 1} / {total}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 transition"
            >✕</button>
          </div>

          {/* CENTER — big photo */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-24 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={usable[index!].public_url!}
              alt=""
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* NAVIGATION ARROWS — fixed to viewport, always centered vertically, never RTL-flipped */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
                className="fixed left-3 md:left-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 hover:bg-white/40 active:bg-white/50 text-white text-3xl md:text-4xl leading-none backdrop-blur border border-white/40 shadow-2xl flex items-center justify-center transition"
              >‹</button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
                className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 hover:bg-white/40 active:bg-white/50 text-white text-3xl md:text-4xl leading-none backdrop-blur border border-white/40 shadow-2xl flex items-center justify-center transition"
              >›</button>
            </>
          )}

          {/* THUMBNAIL STRIP */}
          {total > 1 && (
            <div
              className="px-4 py-3 flex gap-2 overflow-x-auto snap-x snap-mandatory"
              onClick={(e) => e.stopPropagation()}
            >
              {usable.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={
                    'shrink-0 snap-start w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition ' +
                    (i === index ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100')
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.public_url!} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
