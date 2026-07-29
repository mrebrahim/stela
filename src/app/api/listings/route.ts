import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const OwnerSchema = z.object({
  full_name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().nullable().optional()
});

const Schema = z.object({
  listing_type: z.enum(['sale', 'rent']),
  project_id: z.string().uuid(),
  property_type: z.enum(['chalet','villa','townhouse','twin_house','penthouse','duplex','apartment','studio']),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  area_sqm: z.number().positive(),
  price: z.number().positive(),
  rental_period: z.enum(['daily','weekly','monthly','seasonal','annual']).nullable().optional(),
  finishing: z.enum(['fully','semi','core_shell']).nullable().optional(),
  delivery_status: z.enum(['ready','under_construction']).nullable().optional(),
  owner: OwnerSchema
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const admin = createAdminClient();

  // upsert owner by phone
  const { data: existingOwner } = await admin.from('owners').select('id').eq('phone', data.owner.phone).maybeSingle();
  let ownerId = existingOwner?.id as string | undefined;
  if (!ownerId) {
    const { data: newOwner, error: e1 } = await admin.from('owners').insert({
      full_name: data.owner.full_name,
      phone: data.owner.phone,
      email: data.owner.email ?? null
    }).select('id').single();
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    ownerId = newOwner.id;
  }

  const slug =
    `${data.listing_type}-${data.property_type}-${data.bedrooms}br-` +
    Math.random().toString(36).slice(2, 8);

  const { data: listing, error } = await admin.from('listings').insert({
    slug,
    project_id: data.project_id,
    owner_id: ownerId,
    listing_type: data.listing_type,
    status: 'pending',
    source: 'owner_form',
    property_type: data.property_type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area_sqm: data.area_sqm,
    price: data.price,
    rental_period: data.rental_period ?? null,
    finishing: data.finishing ?? null,
    delivery_status: data.delivery_status ?? null
  }).select('id, reference').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('audit_log').insert({
    action: 'listing.submit',
    entity: 'listing',
    entity_id: listing.id,
    diff: { via: 'owner_form' }
  });

  // TODO: send WhatsApp confirmation via Evolution API when configured.

  return NextResponse.json({ ok: true, id: listing.id, reference: listing.reference });
}
