import { getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

type Row = { label: Record<Locale, string>; value: string | number | null | undefined };

type Props = {
  reference: string;
  propertyType: string;
  listingType: 'sale' | 'rent';
  deliveryStatus: string | null;
  saleKind: string | null;
  paymentKind: string | null;
  rentalPeriod: string | null;
  furnished: boolean | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  floor: number | null;
  viewKind: string | null;
  beachDistance: string | null;
  publishedAt: string | null;
};

const L = {
  reference:        { ar: 'الرقم المرجعي',   en: 'Reference #',         ru: 'Референс #',           zh: '参考编号' },
  propertyType:     { ar: 'نوع العقار',       en: 'Property type',       ru: 'Тип недвижимости',     zh: '房产类型' },
  listingType:      { ar: 'نوع العرض',        en: 'Listing type',        ru: 'Тип объявления',       zh: '交易类型' },
  deliveryStatus:   { ar: 'حالة البناء',      en: 'Delivery status',     ru: 'Статус сдачи',         zh: '交付状态' },
  furnishing:       { ar: 'التأثيث',          en: 'Furnishing',          ru: 'Меблировка',           zh: '装饰' },
  saleKind:         { ar: 'الملكية العقارية', en: 'Sale type',           ru: 'Тип продажи',          zh: '销售类型' },
  paymentKind:      { ar: 'طريقة الدفع',      en: 'Payment',             ru: 'Оплата',               zh: '付款方式' },
  rentalPeriod:     { ar: 'مدة الإيجار',      en: 'Rental period',       ru: 'Срок аренды',          zh: '租期' },
  publishedAt:      { ar: 'نُشِر في',          en: 'Published',           ru: 'Опубликовано',         zh: '发布日期' },
  bedrooms:         { ar: 'غرف النوم',        en: 'Bedrooms',            ru: 'Спальни',              zh: '卧室' },
  bathrooms:        { ar: 'الحمامات',         en: 'Bathrooms',           ru: 'Санузлы',              zh: '浴室' },
  area:             { ar: 'المساحة',          en: 'Area',                ru: 'Площадь',              zh: '面积' },
  floor:            { ar: 'الدور',            en: 'Floor',               ru: 'Этаж',                 zh: '楼层' },
  view:             { ar: 'الإطلالة',         en: 'View',                ru: 'Вид',                  zh: '景观' },
  beachDistance:    { ar: 'المسافة من البحر',  en: 'Beach distance',      ru: 'Расстояние до пляжа',  zh: '距海滩距离' }
} as const;

// Enum → localized display name
const V = {
  listingType: {
    sale: { ar: 'للبيع',   en: 'For sale',   ru: 'Продажа', zh: '出售' },
    rent: { ar: 'للإيجار', en: 'For rent',   ru: 'Аренда',  zh: '出租' }
  },
  delivery: {
    ready:              { ar: 'جاهز',          en: 'Ready',              ru: 'Готов',            zh: '现房' },
    under_construction: { ar: 'تحت الإنشاء',   en: 'Under construction', ru: 'Строится',         zh: '在建' }
  },
  furnishing: {
    yes: { ar: 'مفروشة',        en: 'Furnished',      ru: 'С мебелью',       zh: '带家具' },
    no:  { ar: 'غير مفروشة',    en: 'Unfurnished',    ru: 'Без мебели',      zh: '不带家具' }
  },
  sale: {
    developer_contract: { ar: 'عقد المطور',    en: 'Developer contract', ru: 'Договор застройщика', zh: '开发商合同' },
    resale:             { ar: 'إعادة البيع',   en: 'Resale',             ru: 'Перепродажа',         zh: '二手转让' }
  },
  payment: {
    cash:         { ar: 'كاش',      en: 'Cash',         ru: 'Наличные',    zh: '现金' },
    installments: { ar: 'تقسيط',    en: 'Installments', ru: 'Рассрочка',   zh: '分期付款' }
  },
  rentalPeriod: {
    daily:    { ar: 'يومي',    en: 'Daily',    ru: 'Посуточно', zh: '按日' },
    weekly:   { ar: 'أسبوعي',  en: 'Weekly',   ru: 'Понедельно', zh: '按周' },
    monthly:  { ar: 'شهري',    en: 'Monthly',  ru: 'Помесячно',  zh: '按月' },
    seasonal: { ar: 'موسمي',   en: 'Seasonal', ru: 'Сезонно',    zh: '季度' },
    annual:   { ar: 'سنوي',    en: 'Annual',   ru: 'Годовая',    zh: '年租' }
  },
  propertyType: {
    chalet:     { ar: 'شاليه',       en: 'Chalet',        ru: 'Шале',         zh: '小屋' },
    villa:      { ar: 'فيلا',        en: 'Villa',         ru: 'Вилла',        zh: '别墅' },
    townhouse:  { ar: 'تاون هاوس',   en: 'Townhouse',     ru: 'Таунхаус',     zh: '联排别墅' },
    twin_house: { ar: 'توين هاوس',   en: 'Twin house',    ru: 'Твин-хаус',    zh: '双拼别墅' },
    penthouse:  { ar: 'بنتهاوس',     en: 'Penthouse',     ru: 'Пентхаус',     zh: '顶层公寓' },
    duplex:     { ar: 'دوبلكس',      en: 'Duplex',        ru: 'Дуплекс',      zh: '复式公寓' },
    apartment:  { ar: 'شقة',         en: 'Apartment',     ru: 'Квартира',     zh: '公寓' },
    studio:     { ar: 'استوديو',     en: 'Studio',        ru: 'Студия',       zh: '开间' }
  },
  view: {
    sea:    { ar: 'بحر',     en: 'Sea',     ru: 'На море',   zh: '海景' },
    pool:   { ar: 'حمام سباحة', en: 'Pool',    ru: 'Бассейн', zh: '泳池景' },
    lagoon: { ar: 'بحيرة',   en: 'Lagoon',  ru: 'Лагуна',    zh: '泻湖景' },
    golf:   { ar: 'جولف',    en: 'Golf',    ru: 'Гольф',     zh: '高尔夫景' },
    garden: { ar: 'حديقة',   en: 'Garden',  ru: 'Сад',       zh: '花园景' },
    side:   { ar: 'جانبية',  en: 'Side',    ru: 'Боковой',   zh: '侧景' }
  }
} as const;

function loc<T extends Record<Locale, string>>(rec: T | undefined, locale: Locale): string {
  return rec?.[locale] ?? '';
}
function fromDict<K extends string>(
  dict: Record<K, Record<Locale, string>>, key: K | null | undefined, locale: Locale
): string {
  if (!key) return '';
  return dict[key]?.[locale] ?? key;
}

function formatDate(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(
      { ar: 'ar-EG', en: 'en-US', ru: 'ru-RU', zh: 'zh-CN' }[locale],
      { year: 'numeric', month: 'long', day: 'numeric' }
    ).format(new Date(iso));
  } catch { return ''; }
}

export async function PropertyInfoTable(props: Props) {
  const locale = (await getLocale()) as Locale;
  const rows: Row[] = [
    { label: L.propertyType,   value: fromDict(V.propertyType, props.propertyType as keyof typeof V.propertyType, locale) },
    { label: L.listingType,    value: fromDict(V.listingType,   props.listingType, locale) },
    { label: L.reference,      value: props.reference },
    { label: L.deliveryStatus, value: fromDict(V.delivery, props.deliveryStatus as keyof typeof V.delivery | null, locale) },
    { label: L.furnishing,     value: props.furnished == null ? '' : loc(V.furnishing[props.furnished ? 'yes' : 'no'], locale) },
    { label: L.saleKind,       value: fromDict(V.sale,          props.saleKind as keyof typeof V.sale | null, locale) },
    { label: L.paymentKind,    value: fromDict(V.payment,       props.paymentKind as keyof typeof V.payment | null, locale) },
    { label: L.rentalPeriod,   value: fromDict(V.rentalPeriod,  props.rentalPeriod as keyof typeof V.rentalPeriod | null, locale) },
    { label: L.publishedAt,    value: formatDate(props.publishedAt, locale) },
    { label: L.bedrooms,       value: props.bedrooms ?? '' },
    { label: L.bathrooms,      value: props.bathrooms ?? '' },
    { label: L.area,           value: props.areaSqm ? `${props.areaSqm} ${locale === 'ar' ? 'م²' : locale === 'zh' ? '平方米' : 'sqm'}` : '' },
    { label: L.floor,          value: props.floor ?? '' },
    { label: L.view,           value: fromDict(V.view, props.viewKind as keyof typeof V.view | null, locale) },
    { label: L.beachDistance,  value: props.beachDistance ?? '' }
  ].filter((r) => r.value !== '' && r.value != null);

  const half = Math.ceil(rows.length / 2);
  const cols = [rows.slice(0, half), rows.slice(half)];

  return (
    <section>
      <h2 className="text-xl font-bold mb-4 section-title inline-block">
        {locale === 'ar' ? 'معلومات عن العقار' : locale === 'ru' ? 'Информация об объекте' : locale === 'zh' ? '房产信息' : 'Property information'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 rounded-2xl border bg-white p-6 shadow-card mt-4">
        {cols.map((col, i) => (
          <dl key={i} className="divide-y divide-slate-100">
            {col.map((r) => (
              <div key={loc(r.label, locale) + String(r.value)} className="flex items-center justify-between py-3">
                <dt className="text-slate-500 text-sm">{loc(r.label, locale)}</dt>
                <dd className="font-semibold text-slate-900">{r.value}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </section>
  );
}
