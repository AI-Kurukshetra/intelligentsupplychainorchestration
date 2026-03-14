import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { exceptionUpdateSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];
const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exceptions")
    .select(
      "id, type, severity, status, title, description, related_product_id, related_facility_id, assigned_to, created_at, resolved_at"
    )
    .eq("id", id)
    .single();
  if (error || !data) return sendError("Not found", 404);
  return sendSuccess(data);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;

  const parsed = exceptionUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exceptions")
    .update(parsed.data)
    .eq("id", id)
    .select(
      "id, type, severity, status, title, description, related_product_id, related_facility_id, assigned_to, created_at, resolved_at"
    )
    .single();

  if (error || !data) return sendError(error?.message ?? "Update failed", 500);
  return sendSuccess(data, 200, { message: "Exception updated." });
}

