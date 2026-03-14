import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { demandHistoryCreateSchema } from "@/types/schemas";
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
    .from("demand_history")
    .select(
      "id, product_id, period_start, period_end, quantity, source, created_at"
    )
    .order("period_start", { ascending: false });

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const parsed = demandHistoryCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demand_history")
    .insert(parsed.data)
    .select(
      "id, product_id, period_start, period_end, quantity, source, created_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 201, { message: "Demand history added." });
}

