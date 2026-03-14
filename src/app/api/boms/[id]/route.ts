import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { bomUpdateSchema } from "@/types/schemas";
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
    .from("boms")
    .select("id, parent_product_id, component_product_id, quantity, unit_of_measure")
    .eq("id", id)
    .single();
  if (error) return sendError("Not found", 404);
  return sendSuccess(data);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;

  const parsed = bomUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boms")
    .update(parsed.data)
    .eq("id", id)
    .select("id, parent_product_id, component_product_id, quantity, unit_of_measure")
    .single();
  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 200, { message: "BOM updated." });
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;
  const supabase = await createClient();
  const { error } = await supabase.from("boms").delete().eq("id", id);
  if (error) return sendError(error.message, 500);
  return sendSuccess({ id }, 200, { message: "BOM deleted." });
}

