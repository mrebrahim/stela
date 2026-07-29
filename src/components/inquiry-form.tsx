'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  listingId: string;
  reference: string;
  projectId?: string | null;
  className?: string;
};

export function InquiryForm({ listingId, reference, projectId, className }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          project_id: projectId ?? null,
          source: 'form',
          name,
          phone,
          message: message || `Interested in listing ${reference}`
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? 'Something went wrong');
        return;
      }
      setDone(true);
      if (typeof window !== 'undefined') {
        // @ts-expect-error injected
        window.gtag?.('event', 'lead_form_submit', { listing_ref: reference });
        // @ts-expect-error injected
        window.fbq?.('trackCustom', 'LeadFormSubmit', { listing_ref: reference });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          (className ?? '') +
          ' inline-flex items-center justify-center gap-2 bg-stella-600 hover:bg-stella-700 text-white rounded-lg px-4 py-2 font-medium w-full'
        }
      >
        {t('cta.contact')}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold">{t('inquiry.success')}</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md border px-4 py-2"
                >
                  {t('cta.close')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{t('inquiry.title')}</h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-slate-500">
                  {t('listing.reference', { ref: reference })}
                </div>
                <label className="block">
                  <span className="block text-sm text-slate-600 mb-1">{t('inquiry.name')}</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm text-slate-600 mb-1">{t('inquiry.phone')}</span>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1x xxxx xxxx"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm text-slate-600 mb-1">{t('inquiry.message')}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </label>
                {error && (
                  <div className="rounded bg-red-50 border border-red-200 text-red-800 p-2 text-sm">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-md bg-stella-700 text-white px-4 py-2 disabled:opacity-40"
                >
                  {pending ? t('common.loading') : t('cta.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
