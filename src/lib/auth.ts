import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/constants/roles";
import type { User } from "@supabase/supabase-js";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getCurrentUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const profile = await ensureProfile(user);
  return { user, profile };
}

export async function requireAuth() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) return null;
  return { user, profile };
}

export async function requireRole(allowedRoles: Role[]) {
  const data = await requireAuth();
  if (!data) return null;
  const role = (data.profile?.role ?? "viewer") as Role;
  if (!allowedRoles.includes(role)) return null;
  return data;
}

async function ensureProfile(user: User) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, role, supplier_id, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      display_name: (user.user_metadata?.display_name as string | null) ?? null,
      role: ROLES.VIEWER,
    })
    .select("id, email, display_name, avatar_url, role, supplier_id, created_at, updated_at")
    .single();

  if (error) return null;
  return created;
}
