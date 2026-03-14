import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";

export async function GET() {
  const data = await requireAuth();
  if (!data) return sendError("Unauthorized", 401);

  const { user, profile } = data;
  return sendSuccess({
    id: user.id,
    email: user.email ?? null,
    display_name: profile?.display_name ?? null,
    role: profile?.role ?? null,
    supplier_id: profile?.supplier_id ?? null,
  });
}

