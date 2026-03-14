import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireRole([ROLES.ADMIN]);
  if (!auth) {
    return sendError("Forbidden", 403);
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("id", id)
    .single();

  if (profileError || !profile?.email) {
    return sendError("User not found", 404);
  }

  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}${ROUTES.UPDATE_PASSWORD}`;
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    profile.email,
    { redirectTo }
  );

  if (resetError) {
    return sendError(resetError.message, 500);
  }

  return sendSuccess({ message: "Password reset sent." }, 200);
}
