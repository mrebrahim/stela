import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PhotoSchema = z.object({
  storage_path: z.string().min(1),
  public_url: z.string().min(1),
  sort_order: z.number().int().nonnegative().optional(),
  is_primary: z.boolean().optional()
});

const Schema = z.object({
  project_id: z.string().uuid(),
  listing_type: z.enum(['sale','rent']),
  status: z.enum(['draft','pending','verified','published','rejected','archived']).default('published'),
  property_type: z.enum(['chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio']),
  bedrooms: z.number().int().min(0).max(20).nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  area_sqm: z.number().positive().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  view_kind: z.enum(['sea','pool','lagoon','golf','garden','side']).nullable().optional(),
  beach_distance: z.string().nullable().optional(),
  price: z.number().positive(),
  currency: z.string().default('EGP'),
  finishing: z.enum(['fully','semi','core_shell']).nullable().optional(),
  delivery_status: z.enum(['ready','under_construction']).nullable().optional(),
  sale_kind: z.enum(['developer_contract','resale']).nullable().optional(),
  payment_kind: z.enum(['cash','installments']).nullable().optional(),
  down_payment: z.number().nullable().optional(),
  rental_period: z.enum(['daily','weekly','monthly','seasonal','annual']).nullable().optional(),
  furnished: z.boolean().nullable().optional(),
  max_guests: z.number().int().nullable().optional(),
  title_en: z.string().nullable().optional(),
  title_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_ar: z.string().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  video_url: z.string().url().nullable().optional().or(z.literal('').transform(() => null)),
  admin_notes: z.string().nullable().optional(),
  verified: z.boolean().default(true),
  featured: z.boolean().default(false),
  photos: z.array(PhotoSchema).default([])
});

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'listing'
  );
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const db = createAdminClient();

  const seedTitle = d.title_en || d.title_ar || `${d.property_type}-${d.bedrooms ?? ''}br`;
  const slug = `${slugify(seedTitle)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: listing, error } = await db.from('listings').insert({
    slug,
    project_id: d.project_id,
    listing_type: d.listing_type,
    status: d.status,
    source: 'stella_inventory',
    verified: d.verified,
    featured: d.featured,
    property_type: d.property_type,
    bedrooms: d.bedrooms ?? null,
    bathrooms: d.bathrooms ?? null,
    area_sqm: d.area_sqm ?? null,
    floor: d.floor ?? null,
    view_kind: d.view_kind ?? null,
    beach_distance: d.beach_distance ?? null,
    price: d.price,
    currency: d.currency,
    finishing: d.finishing ?? null,
    delivery_status: d.delivery_status ?? null,
    sale_kind: d.sale_kind ?? null,
    payment_kind: d.payment_kind ?? null,
    down_payment: d.down_payment ?? null,
    rental_period: d.rental_period ?? null,
    furnished: d.furnished ?? null,
    max_guests: d.max_guests ?? null,
    title_en: d.title_en ?? null,
    title_ar: d.title_ar ?? null,
    description_en: d.description_en ?? null,
    description_ar: d.description_ar ?? null,
    amenities: d.amenities,
    video_url: d.video_url ?? null,
    admin_notes: d.admin_notes ?? null,
    approved_by: admin.userId,
    approved_at: d.status === 'published' ? new Date().toISOString() : null,
    published_at: d.status === 'published' ? new Date().toISOString() : null
  }).select('id, slug, reference').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (d.photos.length) {
    const rows = d.photos.map((p, i) => ({
      listing_id: listing.id,
      storage_path: p.storage_path,
      public_url: p.public_url,
      sort_order: p.sort_order ?? i,
      is_primary: p.is_primary ?? i === 0
    }));
    const { error: pe } = await db.from('listing_photos').insert(rows);
    if (pe) return NextResponse.json({ error: pe.message }, { status: 500 });
  }

  await db.from('audit_log').insert({
    actor_id: admin.userId,
    actor_role: admin.role,
    action: 'listing.create',
    entity: 'listing',
    entity_id: listing.id
  });

  return NextResponse.json({ ok: true, id: listing.id, slug: listing.slug, reference: listing.reference });
}
