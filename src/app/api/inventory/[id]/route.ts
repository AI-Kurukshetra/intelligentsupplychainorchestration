import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { inventoryAdjustSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];

function computeStatus(qty: unknown, safety: unknown, reorder: unknown) {
  const q = Number(qty) || 0;
  const s = Number(safety) || 0;
  const r = Number(reorder) || 0;
  if (s > 0 && q < s * 0.5) return "critical";
  if (s > 0 && q < s) return "low";
  if (r > 0 && q > r * 3) return "excess";
  return "ok";
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const { id } = await context.params;
  const parsed = inventoryAdjustSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("inventory_levels")
    .select("id, quantity_on_hand, safety_stock_qty, reorder_point")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return sendError("Not found", 404);

  const baseQty = Number(existing.quantity_on_hand) || 0;
  const newQty = baseQty + parsed.data.delta_qty;

  const { data, error: updateError } = await supabase
    .from("inventory_levels")
    .update({ quantity_on_hand: newQty, last_updated: new Date().toISOString() })
    .eq("id", id)
    .select("id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated")
    .single();

  if (updateError || !data) return sendError(updateError?.message ?? "Update failed", 500);

  // Record adjustment
  await supabase.from("inventory_adjustments").insert({
    inventory_level_id: id,
    delta_qty: parsed.data.delta_qty,
    reason: parsed.data.reason,
    adjusted_by: auth.user.id,
  });

  const status = computeStatus(data.quantity_on_hand, data.safety_stock_qty, data.reorder_point);

  return sendSuccess({ ...data, status }, 200, { message: "Inventory adjusted." });
}
