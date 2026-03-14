import { sendError } from "@/lib/utils/api";

export async function GET() {
  return sendError("Deprecated. Use /api/admin/users", 410);
}
