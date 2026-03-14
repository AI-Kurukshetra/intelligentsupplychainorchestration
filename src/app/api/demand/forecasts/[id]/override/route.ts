import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { demandForecastOverrideSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const WRITE_ROLES = [ROLES.ADMIN, ROLES.DEMAND_PLANNER];
type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;

  const parsed = demandForecastOverrideSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { override_qty, override_reason } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("demand_forecasts")
    .update({
      override_qty,
      override_reason,
      created_by: auth.user.id,
    })
    .eq("id", id)
    .select(
      "id, product_id, period_start, period_end, forecast_qty, override_qty, override_reason, created_by, created_at"
    )
    .single();

  if (error || !data) return sendError(error?.message ?? "Not found", error ? 500 : 404);

  return sendSuccess(
    { ...data, effective_qty: data.override_qty ?? data.forecast_qty },
    200,
    { message: "Forecast overridden." }
  );
}

