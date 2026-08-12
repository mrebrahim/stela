import type { Locale } from '@/i18n/config';

export type AmenityCategory =
  | 'unit' | 'health' | 'family' | 'cleaning'
  | 'security' | 'utility' | 'tech' | 'compound';

type AmenityMeta = {
  icon: string;
  label: Record<Locale, string>;
  category: AmenityCategory;
};

// Slug → metadata. Keep slugs snake_case, stable, and lowercase.
export const AMENITY_MAP: Record<string, AmenityMeta> = {
  furnished:                   { icon: '🛋️', category: 'unit',     label: { ar: 'مفروشة',            en: 'Furnished',                    ru: 'С мебелью',                zh: '带家具' } },
  built_in_kitchen_appliances: { icon: '🍳', category: 'unit',     label: { ar: 'أجهزة مطبخ مدمجة', en: 'Built-in kitchen appliances', ru: 'Встроенная кухня',         zh: '嵌入式厨房电器' } },
  pets_allowed:                { icon: '🐾', category: 'unit',     label: { ar: 'مسموح بالحيوانات الأليفة', en: 'Pets allowed',           ru: 'Можно с животными',        zh: '允许携带宠物' } },
  double_glazed_windows:       { icon: '🪟', category: 'unit',     label: { ar: 'نوافذ مزدوجة',      en: 'Double-glazed windows',        ru: 'Стеклопакеты',             zh: '双层玻璃窗' } },
  storage_areas:               { icon: '📦', category: 'unit',     label: { ar: 'مناطق تخزين',       en: 'Storage areas',                ru: 'Кладовые',                 zh: '储物空间' } },
  central_hvac:                { icon: '❄️', category: 'unit',     label: { ar: 'تدفئة وتكييف مركزي', en: 'Central heating & AC',        ru: 'Центральное отопление и кондиционирование', zh: '中央空调' } },
  balcony_terrace:             { icon: '🏠', category: 'unit',     label: { ar: 'شرفة أو تراس',      en: 'Balcony or terrace',           ru: 'Балкон или терраса',       zh: '阳台或露台' } },
  maids_room:                  { icon: '🛏️', category: 'unit',     label: { ar: 'غرفة خدم',          en: 'Maids room',                   ru: 'Комната для персонала',    zh: '佣人房' } },

  first_aid_station:           { icon: '🩺', category: 'health',   label: { ar: 'مركز إسعافات أولية', en: 'First aid station',           ru: 'Пункт первой помощи',      zh: '急救站' } },
  gym:                         { icon: '🏋️', category: 'health',   label: { ar: 'صالة رياضية',       en: 'Gym',                          ru: 'Спортзал',                 zh: '健身房' } },
  pool:                        { icon: '🏊', category: 'health',   label: { ar: 'مسبح',              en: 'Swimming pool',                ru: 'Бассейн',                  zh: '游泳池' } },
  sauna:                       { icon: '🧖', category: 'health',   label: { ar: 'ساونا',             en: 'Sauna',                        ru: 'Сауна',                    zh: '桑拿' } },

  kids_play_area:              { icon: '🎠', category: 'family',   label: { ar: 'منطقة لعب للأطفال',  en: 'Kids play area',               ru: 'Детская площадка',         zh: '儿童游乐区' } },
  garden:                      { icon: '🌳', category: 'family',   label: { ar: 'حديقة',             en: 'Garden',                       ru: 'Сад',                      zh: '花园' } },
  cafeteria:                   { icon: '☕', category: 'family',   label: { ar: 'كافيتيريا',         en: 'Cafeteria',                    ru: 'Кафетерий',                zh: '咖啡厅' } },

  waste_disposal:              { icon: '🗑️', category: 'cleaning', label: { ar: 'مكب نفايات',        en: 'Waste disposal',               ru: 'Вывоз мусора',             zh: '垃圾处理' } },
  maintenance_services:        { icon: '🔧', category: 'cleaning', label: { ar: 'خدمات صيانة',       en: 'Maintenance services',         ru: 'Техническое обслуживание', zh: '维修服务' } },

  security_24_7:               { icon: '👮', category: 'security', label: { ar: 'أمن 24 ساعة',       en: '24/7 security',                ru: 'Охрана 24/7',              zh: '24 小时安保' } },
  parking:                     { icon: '🅿️', category: 'security', label: { ar: 'موقف سيارات',       en: 'Parking',                      ru: 'Парковка',                 zh: '停车场' } },

  electricity_meter:           { icon: '⚡', category: 'utility',  label: { ar: 'عداد كهرباء',       en: 'Electricity meter',            ru: 'Счётчик электричества',    zh: '电表' } },
  water_meter:                 { icon: '💧', category: 'utility',  label: { ar: 'عداد مياه',         en: 'Water meter',                  ru: 'Счётчик воды',             zh: '水表' } },
  laundry_room:                { icon: '🧺', category: 'utility',  label: { ar: 'غرفة غسيل',         en: 'Laundry room',                 ru: 'Прачечная',                zh: '洗衣房' } },

  cable_tv:                    { icon: '📺', category: 'tech',     label: { ar: 'كابل تلفاز',        en: 'Cable TV',                     ru: 'Кабельное ТВ',             zh: '有线电视' } },

  sandy_beach:                 { icon: '🏖️', category: 'compound', label: { ar: 'شاطئ رملي',         en: 'Sandy beach',                  ru: 'Песчаный пляж',            zh: '沙滩' } },
  private_beach:               { icon: '🏖️', category: 'compound', label: { ar: 'شاطئ خاص',          en: 'Private beach',                ru: 'Собственный пляж',         zh: '私人海滩' } },
  beach:                       { icon: '🏖️', category: 'compound', label: { ar: 'شاطئ',              en: 'Beach',                        ru: 'Пляж',                     zh: '海滩' } },
  golf_course:                 { icon: '⛳', category: 'compound', label: { ar: 'ملعب جولف',         en: 'Golf course',                  ru: 'Поле для гольфа',          zh: '高尔夫球场' } },
  marina:                      { icon: '⚓', category: 'compound', label: { ar: 'مارينا',            en: 'Marina',                       ru: 'Марина',                   zh: '码头' } },
  hotels:                      { icon: '🏨', category: 'compound', label: { ar: 'فنادق',             en: 'Hotels',                       ru: 'Отели',                    zh: '酒店' } },
  hotel:                       { icon: '🏨', category: 'compound', label: { ar: 'فندق',              en: 'Hotel',                        ru: 'Отель',                    zh: '酒店' } },
  restaurants_cafes:           { icon: '🍽️', category: 'compound', label: { ar: 'مطاعم وكافيهات',    en: 'Restaurants & cafés',          ru: 'Рестораны и кафе',         zh: '餐厅和咖啡馆' } },
  restaurants:                 { icon: '🍽️', category: 'compound', label: { ar: 'مطاعم',             en: 'Restaurants',                  ru: 'Рестораны',                zh: '餐厅' } },
  pools:                       { icon: '🏊', category: 'compound', label: { ar: 'حمامات سباحة',      en: 'Swimming pools',               ru: 'Бассейны',                 zh: '游泳池' } },
  clubhouse:                   { icon: '🏛️', category: 'compound', label: { ar: 'كلوب هاوس',         en: 'Clubhouse',                    ru: 'Клубный дом',              zh: '俱乐部会所' } },
  spa:                         { icon: '💆', category: 'compound', label: { ar: 'سبا',               en: 'Spa',                          ru: 'Спа',                      zh: '水疗中心' } },
  lagoon:                      { icon: '🌊', category: 'compound', label: { ar: 'بحيرة',             en: 'Lagoon',                       ru: 'Лагуна',                   zh: '泻湖' } },
  security:                    { icon: '👮', category: 'security', label: { ar: 'الأمن',             en: 'Security',                     ru: 'Охрана',                   zh: '安保' } },
  cctv:                        { icon: '📹', category: 'security', label: { ar: 'كاميرات مراقبة',    en: 'CCTV',                         ru: 'Видеонаблюдение',          zh: '监控摄像头' } },
  covered_parking:             { icon: '🚗', category: 'security', label: { ar: 'مواقف مغطاة',       en: 'Covered parking',              ru: 'Крытая парковка',          zh: '室内停车位' } },
  sea_view:                    { icon: '🌊', category: 'unit',     label: { ar: 'يطل على البحر',     en: 'Sea view',                     ru: 'Вид на море',              zh: '海景' } },
  jacuzzi:                     { icon: '🛁', category: 'health',   label: { ar: 'جاكوزي',            en: 'Jacuzzi',                      ru: 'Джакузи',                  zh: '按摩浴缸' } },
  bbq_area:                    { icon: '🍖', category: 'family',   label: { ar: 'مكان للشواء',       en: 'BBQ area',                     ru: 'Зона барбекю',             zh: '烧烤区' } },
  broadband_internet:          { icon: '📶', category: 'tech',     label: { ar: 'إنترنت عالي السرعة', en: 'Broadband internet',          ru: 'Широкополосный интернет',  zh: '宽带网络' }  },
  emergency_power:             { icon: '🔋', category: 'utility',  label: { ar: 'كهرباء احتياطية',   en: 'Emergency power',              ru: 'Резервное питание',        zh: '备用电源' } },
  childcare_center:            { icon: '👶', category: 'family',   label: { ar: 'مركز رعاية أطفال',  en: 'Childcare center',             ru: 'Детский центр',            zh: '托儿中心' } },
  intercom:                    { icon: '☎️', category: 'tech',     label: { ar: 'اتصال داخلي',       en: 'Intercom',                     ru: 'Домофон',                  zh: '对讲机' } },
  landline:                    { icon: '📞', category: 'tech',     label: { ar: 'خط أرضي',           en: 'Landline',                     ru: 'Стационарный телефон',     zh: '固定电话' } },
  meeting_room:                { icon: '👥', category: 'family',   label: { ar: 'غرفة اجتماعات',     en: 'Meeting room',                 ru: 'Комната для собраний',     zh: '会议室' } },
  elevator:                    { icon: '🛗', category: 'unit',     label: { ar: 'مصعد',              en: 'Elevator',                     ru: 'Лифт',                     zh: '电梯' } },
  cleaning_services:           { icon: '🧹', category: 'cleaning', label: { ar: 'خدمات تنظيف',       en: 'Cleaning services',            ru: 'Уборка',                   zh: '清洁服务' } },
  laundry_service:             { icon: '🧼', category: 'cleaning', label: { ar: 'خدمة غسيل ملابس',   en: 'Laundry service',              ru: 'Услуги прачечной',         zh: '洗衣服务' } },
  nearby_shopping:             { icon: '🛍️', category: 'compound', label: { ar: 'مراكز تسوق قريبة',  en: 'Nearby shopping',              ru: 'Магазины рядом',           zh: '附近购物中心' } },
  panoramic_view:              { icon: '🖼️', category: 'unit',     label: { ar: 'إطلالة بانورامية',  en: 'Panoramic view',               ru: 'Панорамный вид',           zh: '全景视野' } },
  golf_view:                   { icon: '⛳', category: 'unit',     label: { ar: 'إطلالة على الجولف', en: 'Golf view',                    ru: 'Вид на гольф',             zh: '高尔夫景观' } },
  pool_view:                   { icon: '💦', category: 'unit',     label: { ar: 'إطلالة على المسبح', en: 'Pool view',                    ru: 'Вид на бассейн',           zh: '泳池景观' } },
  prayer_room:                 { icon: '🕌', category: 'family',   label: { ar: 'غرفة صلاة',         en: 'Prayer room',                  ru: 'Молитвенная комната',      zh: '祈祷室' } },
  business_center:             { icon: '💼', category: 'family',   label: { ar: 'مركز أعمال',        en: 'Business center',              ru: 'Бизнес-центр',             zh: '商务中心' } }
};

export const CATEGORY_LABELS: Record<AmenityCategory, Record<Locale, string>> = {
  unit:     { ar: 'مزايا الوحدة',    en: 'Unit features',            ru: 'Особенности юнита',        zh: '房产特色' },
  health:   { ar: 'الصحة واللياقة',  en: 'Health & fitness',         ru: 'Здоровье и фитнес',        zh: '健康与健身' },
  family:   { ar: 'الترفيه والأسرة', en: 'Family & leisure',         ru: 'Семья и досуг',            zh: '家庭与休闲' },
  cleaning: { ar: 'التنظيف والصيانة', en: 'Cleaning & maintenance',  ru: 'Уборка и обслуживание',    zh: '清洁与维护' },
  security: { ar: 'الأمن والحماية',   en: 'Security & safety',        ru: 'Безопасность',             zh: '安全保障' },
  utility:  { ar: 'الخدمات العامة',   en: 'Utilities',                ru: 'Инженерные системы',       zh: '公共服务' },
  tech:     { ar: 'الخدمات التقنية',  en: 'Technical services',       ru: 'Технические услуги',       zh: '技术服务' },
  compound: { ar: 'خدمات القرية',    en: 'Compound amenities',        ru: 'Инфраструктура курорта',   zh: '小区配套' }
};

const CATEGORY_ORDER: AmenityCategory[] = ['unit', 'health', 'family', 'cleaning', 'security', 'utility', 'tech', 'compound'];

export type AmenityGroup = { category: AmenityCategory; items: { slug: string; icon: string; label: string }[] };

// Group amenity slugs by category and localize labels. Unknown slugs are put in "unit" with a default icon.
export function groupAmenities(slugs: string[], locale: Locale): AmenityGroup[] {
  const buckets = new Map<AmenityCategory, { slug: string; icon: string; label: string }[]>();
  for (const raw of slugs) {
    const slug = raw.toLowerCase().replace(/-/g, '_');
    const meta = AMENITY_MAP[slug];
    const item = meta
      ? { slug, icon: meta.icon, label: meta.label[locale] }
      : { slug, icon: '✨', label: slug.replace(/_/g, ' ') };
    const cat = meta?.category ?? 'unit';
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat)!.push(item);
  }
  return CATEGORY_ORDER
    .filter((c) => buckets.has(c))
    .map((category) => ({ category, items: buckets.get(category)! }));
}
