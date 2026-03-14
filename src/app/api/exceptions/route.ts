import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { exceptionCreateSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];
const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];

export async function GET(request: NextRequest) {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const type = url.searchParams.get("type");

  const supabase = await createClient();
  let query = supabase
    .from("exceptions")
    .select(
      "id, type, severity, status, title, description, related_product_id, related_facility_id, assigned_to, created_at, resolved_at"
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (severity) query = query.eq("severity", severity);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const parsed = exceptionCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exceptions")
    .insert({
      ...parsed.data,
      status: "open",
    })
    .select(
      "id, type, severity, status, title, description, related_product_id, related_facility_id, assigned_to, created_at, resolved_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 201, { message: "Exception created." });
}

