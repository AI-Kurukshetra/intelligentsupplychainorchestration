import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];

function computeStatus(qty: unknown, safety: unknown, reorder: unknown) {
  const q = Number(qty) || 0;
  const s = Number(safety) || 0;
  const r = Number(reorder) || 0;
  if (s > 0 && q < s * 0.5) return "critical";
  if (s > 0 && q < s) return "low";
  if (r > 0 && q > r * 3) return "excess";
  return "ok";
}

export async function GET() {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_levels")
    .select(
      "id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated"
    );

  if (error) return sendError(error.message, 500);

  const computed =
    data?.map((row) => {
      const quantity_on_hand = Number(row.quantity_on_hand) || 0;
      const safety_stock_qty = Number(row.safety_stock_qty) || 0;
      const reorder_point = Number(row.reorder_point) || 0;
      const status = computeStatus(quantity_on_hand, safety_stock_qty, reorder_point);
      return { ...row, quantity_on_hand, safety_stock_qty, reorder_point, status };
    }) ?? [];

  const alerts = computed.filter((c) => c.status === "critical" || c.status === "low" || c.status === "excess");
  return sendSuccess(alerts);
}
