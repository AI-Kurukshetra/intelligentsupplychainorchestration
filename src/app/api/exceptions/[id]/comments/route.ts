import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { exceptionCommentSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";

const READ_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER, ROLES.VIEWER];
const WRITE_ROLES = [ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER];
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  const auth = await requireRole(READ_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_comments")
    .select("id, exception_id, author_id, content, created_at")
    .eq("exception_id", id)
    .order("created_at", { ascending: true });
  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireRole(WRITE_ROLES);
  if (!auth) return sendError("Forbidden", 403);
  const { id } = await context.params;
  const parsed = exceptionCommentSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_comments")
    .insert({
      exception_id: id,
      content: parsed.data.content,
      author_id: auth.user.id,
    })
    .select("id, exception_id, author_id, content, created_at")
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 201, { message: "Comment added." });
}

