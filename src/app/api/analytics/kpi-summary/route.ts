import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { ROLES } from "@/constants/roles";

type Summary = {
  forecast_accuracy: number;
  exceptions: { severity: string; count: number }[];
  inventory_health: { status: string; count: number }[];
};

export async function GET() {
  const auth = await requireRole([
    ROLES.ADMIN,
    ROLES.SUPPLY_PLANNER,
    ROLES.DEMAND_PLANNER,
    ROLES.VIEWER,
  ]);
  if (!auth) return sendError("Forbidden", 403);

  const supabase = await createClient();

  // forecast accuracy heuristic: 1 - average(abs(delta)/actual) on last 30 days history vs forecast.
  const { data: hist } = await supabase
    .from("demand_history")
    .select("quantity, period_end")
    .gte("period_end", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString());
  const { data: fc } = await supabase
    .from("demand_forecasts")
    .select("forecast_qty, override_qty, period_end")
    .gte("period_end", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString());

  let forecast_accuracy = 0;
  if (hist && fc && hist.length && fc.length) {
    const actual = hist.reduce((sum, h) => sum + (h.quantity ?? 0), 0);
    const predicted = fc.reduce(
      (sum, f) => sum + (f.override_qty ?? f.forecast_qty ?? 0),
      0
    );
    if (actual > 0) {
      forecast_accuracy = Math.max(0, 1 - Math.abs(predicted - actual) / actual);
    }
  }

  const { data: exceptions } = await supabase
    .from("exceptions")
    .select("severity");
  const exceptionCounts =
    exceptions?.reduce<Record<string, number>>((acc, e) => {
      acc[e.severity] = (acc[e.severity] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  const { data: inventoryLevels } = await supabase
    .from("inventory_levels")
    .select("quantity_on_hand, safety_stock_qty, reorder_point");

  const invCounts: Record<string, number> = { critical: 0, low: 0, ok: 0, excess: 0 };
  if (inventoryLevels) {
    for (const row of inventoryLevels) {
      const qty = row.quantity_on_hand ?? 0;
      const safety = row.safety_stock_qty ?? 0;
      const reorder = row.reorder_point ?? 0;
      const status =
        qty < safety * 0.5
          ? "critical"
          : qty < safety
            ? "low"
            : qty > reorder * 3
              ? "excess"
              : "ok";
      invCounts[status] = (invCounts[status] ?? 0) + 1;
    }
  }

  const summary: Summary = {
    forecast_accuracy,
    exceptions: Object.entries(exceptionCounts).map(([severity, count]) => ({ severity, count })),
    inventory_health: Object.entries(invCounts).map(([status, count]) => ({ status, count })),
  };

  return sendSuccess(summary);
}
