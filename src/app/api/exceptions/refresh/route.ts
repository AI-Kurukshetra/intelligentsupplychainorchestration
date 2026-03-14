import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { ROLES } from "@/constants/roles";

const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];

function computeStatus(qty: number, safety: number, reorder: number) {
  if (qty < safety * 0.5) return "critical";
  if (qty < safety) return "low";
  if (qty > reorder * 3) return "excess";
  return "ok";
}

function mapStatusToException(status: string) {
  if (status === "critical" || status === "low") return "stockout_risk" as const;
  if (status === "excess") return "excess_inventory" as const;
  return null;
}

function severityForStatus(status: string) {
  if (status === "critical") return "critical";
  if (status === "low") return "high";
  if (status === "excess") return "medium";
  return "low";
}

export async function POST() {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const supabase = await createClient();
  const { data: inventory, error } = await supabase
    .from("inventory_levels")
    .select("id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point");

  if (error) return sendError(error.message, 500);

  let created = 0;
  if (inventory) {
    for (const row of inventory) {
      const status = computeStatus(
        row.quantity_on_hand ?? 0,
        row.safety_stock_qty ?? 0,
        row.reorder_point ?? 0
      );
      const type = mapStatusToException(status);
      if (!type) continue;

      const { data: existing } = await supabase
        .from("exceptions")
        .select("id")
        .eq("type", type)
        .eq("related_product_id", row.product_id)
        .eq("related_facility_id", row.facility_id)
        .in("status", ["open", "in_review"])
        .maybeSingle();

      if (existing) continue;

      const { error: createError } = await supabase.from("exceptions").insert({
        type,
        severity: severityForStatus(status),
        status: "open",
        title: type === "excess_inventory" ? "Excess inventory detected" : "Stockout risk detected",
        description: `System-generated from inventory status ${status}.`,
        related_product_id: row.product_id,
        related_facility_id: row.facility_id,
      });

      if (!createError) created += 1;
    }
  }

  return sendSuccess({ created }, 200, { message: "Auto-detection executed." });
}

