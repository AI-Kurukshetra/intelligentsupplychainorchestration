import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { updateUserRoleSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";
import type { Profile } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Update a user's role (and supplier_id when role is supplier). Admin only.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole([ROLES.ADMIN]);
  if (!auth) return sendError("Forbidden", 403);

  const { id } = await context.params;

  const parsed = updateUserRoleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const { role, supplier_id } = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, avatar_url, role, supplier_id, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return sendError("User not found", 404);
  }

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update({
      role,
      supplier_id: role === ROLES.SUPPLIER ? supplier_id ?? null : null,
    })
    .eq("id", id)
    .select(
      "id, email, display_name, avatar_url, role, supplier_id, created_at, updated_at"
    )
    .single();

  if (updateError) {
    return sendError(updateError.message, 500);
  }

  return sendSuccess<Profile>(data as Profile, 200, {
    message: "User role updated.",
  });
}

