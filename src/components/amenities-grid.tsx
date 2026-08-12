import { getLocale } from 'next-intl/server';
import { groupAmenities, CATEGORY_LABELS } from '@/lib/amenities';
import type { Locale } from '@/i18n/config';

export async function AmenitiesGrid({ slugs }: { slugs: string[] }) {
  const locale = (await getLocale()) as Locale;
  const groups = groupAmenities(slugs, locale);
  if (groups.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4 section-title inline-block">
        {locale === 'ar' ? 'المزايا والخدمات' : locale === 'ru' ? 'Удобства и услуги' : locale === 'zh' ? '设施与服务' : 'Features & amenities'}
      </h2>
      <div className="space-y-6 mt-4">
        {groups.map((g) => (
          <div key={g.category}>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {CATEGORY_LABELS[g.category][locale]}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {g.items.map((it) => (
                <div
                  key={it.slug}
                  className="rounded-xl border bg-white p-4 flex flex-col items-center gap-2 text-center hover:shadow-card transition"
                >
                  <span className="text-3xl" aria-hidden>{it.icon}</span>
                  <span className="text-sm text-slate-800 leading-tight">{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
