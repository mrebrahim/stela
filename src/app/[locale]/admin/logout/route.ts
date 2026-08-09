import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(req.url);
  const locale = url.pathname.split('/')[1] || 'ar';
  return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url), { status: 303 });
}
