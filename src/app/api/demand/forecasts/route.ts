import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { demandForecastCreateSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];
const WRITE_ROLES = [ROLES.ADMIN, ROLES.DEMAND_PLANNER];

export async function GET(request: NextRequest) {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  const supabase = await createClient();
  let query = supabase
    .from("demand_forecasts")
    .select(
      "id, product_id, period_start, period_end, forecast_qty, override_qty, override_reason, created_by, created_at"
    )
    .order("period_start", { ascending: false });

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  const forecasts = (data ?? []).map((f) => ({
    ...f,
    effective_qty: f.override_qty ?? f.forecast_qty,
  }));

  return sendSuccess(forecasts);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const parsed = demandForecastCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());
  const { product_id, period_start, period_end, forecast_qty } = parsed.data;

  const supabase = await createClient();

  // Compute 3-period moving average if forecast_qty not provided
  let qty = forecast_qty;
  if (qty === undefined) {
    const { data: history } = await supabase
      .from("demand_history")
      .select("quantity, period_end")
      .eq("product_id", product_id)
      .lte("period_end", period_start)
      .order("period_end", { ascending: false })
      .limit(3);
    if (history && history.length > 0) {
      const sum = history.reduce((acc, h) => acc + (h.quantity ?? 0), 0);
      qty = sum / history.length;
    } else {
      qty = 0;
    }
  }

  const { data, error } = await supabase
    .from("demand_forecasts")
    .insert({
      product_id,
      period_start,
      period_end,
      forecast_qty: qty,
    })
    .select(
      "id, product_id, period_start, period_end, forecast_qty, override_qty, override_reason, created_by, created_at"
    )
    .single();

  if (error) return sendError(error.message, 500);

  return sendSuccess(
    { ...data, effective_qty: data.override_qty ?? data.forecast_qty },
    201,
    { message: "Forecast saved." }
  );
}

