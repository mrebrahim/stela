// Hand-authored DB types (mirror of supabase/migrations/*).
// Regenerate with `supabase gen types typescript --project-id pxbzovfabgpxddlibwhi`
// once you install the Supabase CLI.

export type LocationArea = 'north_coast' | 'ain_sokhna';
export type PropertyType = 'chalet' | 'villa' | 'townhouse' | 'twin_house' | 'penthouse' | 'duplex' | 'apartment' | 'studio';
export type ListingType = 'sale' | 'rent';
export type ListingStatus = 'draft' | 'pending' | 'verified' | 'published' | 'rejected' | 'archived';
export type ListingSource = 'owner_form' | 'stella_inventory' | 'import';
export type ViewKind = 'sea' | 'pool' | 'lagoon' | 'golf' | 'garden' | 'side';
export type RentalPeriod = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual';
export type Finishing = 'fully' | 'semi' | 'core_shell';
export type PaymentKind = 'cash' | 'installments';
export type SaleKind = 'developer_contract' | 'resale';
export type DeliveryKind = 'ready' | 'under_construction';

export interface Project {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  area: LocationArea;
  developer: string | null;
  description_en: string | null;
  description_ar: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  land_area_m2: number | null;
  total_units: number | null;
  delivery_date: string | null;
  km_marker: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  faq_en: unknown;
  faq_ar: unknown;
  is_active: boolean;
  sort_order: number;
}

export interface Listing {
  id: string;
  reference: string;
  slug: string;
  project_id: string;
  unit_type_id: string | null;
  owner_id: string | null;
  listing_type: ListingType;
  status: ListingStatus;
  source: ListingSource;
  verified: boolean;
  featured: boolean;
  property_type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  floor: number | null;
  view_kind: ViewKind | null;
  beach_distance: string | null;
  price: number | null;
  currency: string;
  finishing: Finishing | null;
  delivery_status: DeliveryKind | null;
  sale_kind: SaleKind | null;
  payment_kind: PaymentKind | null;
  down_payment: number | null;
  rental_period: RentalPeriod | null;
  furnished: boolean | null;
  max_guests: number | null;
  available_from: string | null;
  available_to: string | null;
  title_en: string | null;
  title_ar: string | null;
  title_ru: string | null;
  title_zh: string | null;
  description_en: string | null;
  description_ar: string | null;
  description_ru: string | null;
  description_zh: string | null;
  locales: string[];
  video_url: string | null;
  amenities: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingWithProject extends Listing {
  project: Pick<Project, 'id' | 'slug' | 'name_en' | 'name_ar' | 'area'>;
  photos?: { public_url: string | null; storage_path: string; is_primary: boolean }[];
}
