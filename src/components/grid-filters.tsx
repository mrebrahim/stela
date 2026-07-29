'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type ProjectOpt = { slug: string; name: string };
type Props = {
  projects: ProjectOpt[];
  showRental?: boolean;
};

export function GridFilters({ projects, showRental }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations();

  const state = useMemo(() => ({
    project: params.get('project') ?? '',
    bedrooms: params.get('beds') ?? '',
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    propertyType: params.get('type') ?? '',
    rentalPeriod: params.get('period') ?? ''
  }), [params]);

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <aside className="rounded-xl border p-4 bg-white space-y-4 text-sm">
      <div>
        <label className="block text-slate-600 mb-1">{t('filters.project')}</label>
        <select
          className="w-full border rounded-md px-2 py-1.5"
          value={state.project}
          onChange={(e) => update({ project: e.target.value })}
        >
          <option value="">—</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-slate-600 mb-1">{t('filters.propertyType')}</label>
        <select
          className="w-full border rounded-md px-2 py-1.5"
          value={state.propertyType}
          onChange={(e) => update({ type: e.target.value })}
        >
          <option value="">—</option>
          {['chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio'].map((k) => (
            <option key={k} value={k}>{t(`filters.propertyTypes.${k}`)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-slate-600 mb-1">{t('filters.bedrooms')}</label>
        <select
          className="w-full border rounded-md px-2 py-1.5"
          value={state.bedrooms}
          onChange={(e) => update({ beds: e.target.value })}
        >
          <option value="">—</option>
          {['0','1','2','3','4','5'].map((n) => <option key={n} value={n}>{n === '5' ? '5+' : n}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-slate-600 mb-1">{t('filters.price')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            className="w-1/2 border rounded-md px-2 py-1.5"
            placeholder={t('filters.min')}
            value={state.minPrice}
            onChange={(e) => update({ min: e.target.value })}
          />
          <input
            type="number"
            inputMode="numeric"
            className="w-1/2 border rounded-md px-2 py-1.5"
            placeholder={t('filters.max')}
            value={state.maxPrice}
            onChange={(e) => update({ max: e.target.value })}
          />
        </div>
      </div>

      {showRental && (
        <div>
          <label className="block text-slate-600 mb-1">{t('filters.rentalPeriod')}</label>
          <select
            className="w-full border rounded-md px-2 py-1.5"
            value={state.rentalPeriod}
            onChange={(e) => update({ period: e.target.value })}
          >
            <option value="">—</option>
            {['daily','weekly','monthly','seasonal','annual'].map((k) => (
              <option key={k} value={k}>{t(`filters.rentalPeriods.${k}`)}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.replace(pathname)}
        className="w-full mt-2 rounded-md border py-1.5 text-slate-700 hover:bg-slate-50"
      >
        {t('cta.reset')}
      </button>
    </aside>
  );
}
