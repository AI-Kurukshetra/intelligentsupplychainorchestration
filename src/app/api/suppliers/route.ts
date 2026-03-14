import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { supplierCreateSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];
const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];

export async function GET() {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_email, contact_name, country, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);

  const parsed = supplierCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert(parsed.data)
    .select("id, name, contact_email, contact_name, country, status, created_at")
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 201, { message: "Supplier created." });
}

