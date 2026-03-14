import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { createUserSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";
import type { UserListItem } from "@/types/api";
import { ROUTES } from "@/constants/routes";

export async function POST(request: NextRequest) {
  const auth = await requireRole([ROLES.ADMIN]);
  if (!auth) {
    return sendError("Forbidden", 403);
  }

  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const { email, display_name, role, supplier_id } = parsed.data;
  const supabase = createAdminClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name },
  });

  if (createError) {
    return sendError(createError.message, 500);
  }

  const userId = created.user?.id ?? null;
  const updateQuery = supabase
    .from("profiles")
    .update({
      role,
      supplier_id: role === ROLES.SUPPLIER ? supplier_id ?? null : null,
    });

  const { data: updatedProfile, error: profileError } = userId
    ? await updateQuery
        .eq("id", userId)
        .select("id, email, display_name, avatar_url, role, supplier_id, created_at")
        .single()
    : await updateQuery
        .eq("email", email)
        .select("id, email, display_name, avatar_url, role, supplier_id, created_at")
        .single();

  if (profileError || !updatedProfile) {
    return sendError(profileError?.message ?? "Failed to update profile.", 500);
  }

  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}${ROUTES.UPDATE_PASSWORD}`;
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (resetError) {
    return sendError(resetError.message, 500);
  }

  return sendSuccess<UserListItem>(updatedProfile as UserListItem, 201, {
    message: "User invited.",
  });
}
