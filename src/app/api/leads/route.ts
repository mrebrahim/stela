import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

// Public POST /api/leads — inbound WhatsApp webhook or manual lead capture.
const Schema = z.object({
  listing_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  source: z.enum(['whatsapp','call','form','import']).default('whatsapp'),
  name: z.string().max(120).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  whatsapp_ref: z.string().max(200).nullable().optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.from('leads').insert(parsed.data).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
