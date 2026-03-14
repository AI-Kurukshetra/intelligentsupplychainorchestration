import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
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

export async function GET(request: NextRequest) {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  const facilityId = url.searchParams.get("facility_id");
  const statusFilter = url.searchParams.get("status");

  const supabase = await createClient();
  let query = supabase
    .from("inventory_levels")
    .select(
      "id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated"
    );

  if (productId) query = query.eq("product_id", productId);
  if (facilityId) query = query.eq("facility_id", facilityId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  const computed = (data ?? []).map((row) => {
    const quantity_on_hand = Number(row.quantity_on_hand) || 0;
    const safety_stock_qty = Number(row.safety_stock_qty) || 0;
    const reorder_point = Number(row.reorder_point) || 0;
    const status = computeStatus(quantity_on_hand, safety_stock_qty, reorder_point);
    return { ...row, quantity_on_hand, safety_stock_qty, reorder_point, status };
  });

  const filtered = statusFilter ? computed.filter((c) => c.status === statusFilter) : computed;
  return sendSuccess(filtered);
}
