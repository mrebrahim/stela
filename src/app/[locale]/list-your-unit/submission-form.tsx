'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

type ProjectOpt = { id: string; slug: string; name: string };
type Step = 0 | 1 | 2 | 3 | 4 | 5;

export function SubmissionForm({ locale, projects }: { locale: Locale; projects: ProjectOpt[] }) {
  const t = useTranslations();
  const [step, setStep] = useState<Step>(0);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [intent, setIntent] = useState<'sell' | 'rent'>('sell');
  const [projectId, setProjectId] = useState('');
  const [propertyType, setPropertyType] = useState('chalet');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [areaSqm, setAreaSqm] = useState('');
  const [price, setPrice] = useState('');
  const [rentalPeriod, setRentalPeriod] = useState('monthly');
  const [finishing, setFinishing] = useState('fully');
  const [deliveryStatus, setDeliveryStatus] = useState('ready');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const steps = ['intent', 'unit', 'commercials', 'photos', 'contact', 'confirm'] as const;
  const canNext =
    (step === 0 && !!projectId) ||
    (step === 1 && !!bedrooms && !!areaSqm) ||
    (step === 2 && !!price) ||
    step === 3 ||
    (step === 4 && !!name && !!phone) ||
    step === 5;

  function submit() {
    setError(null);
    start(async () => {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          listing_type: intent === 'sell' ? 'sale' : 'rent',
          project_id: projectId,
          property_type: propertyType,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area_sqm: Number(areaSqm),
          price: Number(price),
          rental_period: intent === 'rent' ? rentalPeriod : null,
          finishing: intent === 'sell' ? finishing : null,
          delivery_status: intent === 'sell' ? deliveryStatus : null,
          owner: { full_name: name, phone, email: email || null }
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? 'Something went wrong');
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-6 text-emerald-900">
        <div className="text-2xl mb-2">✅</div>
        <div className="font-semibold">{t('list.success')}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">{t('list.title')}</h1>
      <p className="text-slate-600 mt-1">{t('list.sub')}</p>

      <ol className="flex flex-wrap gap-2 my-6 text-sm">
        {steps.map((k, i) => (
          <li
            key={k}
            className={
              'rounded-full px-3 py-1 border ' +
              (i === step ? 'bg-stella-600 text-white border-stella-600' :
               i < step ? 'bg-slate-100 text-slate-500' : 'text-slate-500')
            }
          >
            {i + 1}. {t(`list.steps.${k}`)}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border p-6 bg-white space-y-4">
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIntent('sell')}
                className={'rounded-lg border p-4 text-start ' + (intent === 'sell' ? 'border-stella-600 bg-stella-50' : '')}
              >
                <div className="font-semibold">{t('list.intent.sell')}</div>
              </button>
              <button
                type="button"
                onClick={() => setIntent('rent')}
                className={'rounded-lg border p-4 text-start ' + (intent === 'rent' ? 'border-stella-600 bg-stella-50' : '')}
              >
                <div className="font-semibold">{t('list.intent.rent')}</div>
              </button>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">{t('list.intent.pickProject')}</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">—</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('filters.propertyType')}>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full border rounded-md px-3 py-2">
                {['chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio'].map((k) => (
                  <option key={k} value={k}>{t(`filters.propertyTypes.${k}`)}</option>
                ))}
              </select>
            </Field>
            <Field label={t('filters.bedrooms')}>
              <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label={t('filters.bathrooms')}>
              <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label={t('filters.area')}>
              <input type="number" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('filters.price')}>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
            {intent === 'rent' ? (
              <Field label={t('filters.rentalPeriod')}>
                <select value={rentalPeriod} onChange={(e) => setRentalPeriod(e.target.value)} className="w-full border rounded-md px-3 py-2">
                  {['daily','weekly','monthly','seasonal','annual'].map((k) => (
                    <option key={k} value={k}>{t(`filters.rentalPeriods.${k}`)}</option>
                  ))}
                </select>
              </Field>
            ) : (
              <>
                <Field label={t('filters.finishing')}>
                  <select value={finishing} onChange={(e) => setFinishing(e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option value="fully">fully</option>
                    <option value="semi">semi</option>
                    <option value="core_shell">core &amp; shell</option>
                  </select>
                </Field>
                <Field label={t('filters.deliveryStatus')}>
                  <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option value="ready">ready</option>
                    <option value="under_construction">under construction</option>
                  </select>
                </Field>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="rounded-lg border-dashed border-2 p-8 text-center text-slate-500">
            {t('list.photos.hint')}
            <div className="mt-2 text-xs">
              (Storage upload uses the bucket <code>listings</code>. In this scaffold, the client seam
              is here — wire multipart upload later.)
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <Field label={t('list.contact.name')}>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label={t('list.contact.phone')}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 1x xxxx xxxx" className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label={t('list.contact.email')}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            <Summary label={t('list.steps.intent')} value={t(`list.intent.${intent}`)} />
            <Summary label={t('filters.project')} value={projects.find((p) => p.id === projectId)?.name ?? ''} />
            <Summary label={t('filters.propertyType')} value={t(`filters.propertyTypes.${propertyType}`)} />
            <Summary label={t('filters.bedrooms')} value={bedrooms} />
            <Summary label={t('filters.area')} value={areaSqm} />
            <Summary label={t('filters.price')} value={price} />
            {intent === 'rent' && <Summary label={t('filters.rentalPeriod')} value={t(`filters.rentalPeriods.${rentalPeriod}`)} />}
            <Summary label={t('list.contact.name')} value={name} />
            <Summary label={t('list.contact.phone')} value={phone} />
          </div>
        )}

        {error && <div className="rounded bg-red-50 border border-red-200 text-red-800 p-3 text-sm">{error}</div>}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="rounded-md border px-4 py-2 disabled:opacity-40"
          >
            {t('cta.back')}
          </button>
          {step < 5 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="rounded-md bg-stella-600 text-white px-4 py-2 disabled:opacity-40"
            >
              {t('cta.next')}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="rounded-md bg-stella-700 text-white px-4 py-2 disabled:opacity-40"
            >
              {pending ? t('common.loading') : t('cta.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 truncate">{value}</span>
    </div>
  );
}
