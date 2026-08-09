import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

export type AdminSession = {
  userId: string;
  email: string;
  role: 'admin' | 'moderator';
  fullName: string | null;
};

// Returns the current admin session, or null if not signed in / not an admin.
export async function getAdmin(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('admin_users')
    .select('id, role, full_name, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!row || !row.is_active) return null;
  return {
    userId: user.id,
    email: user.email ?? '',
    role: row.role,
    fullName: row.full_name
  };
}
