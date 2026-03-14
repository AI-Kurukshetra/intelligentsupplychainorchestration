export async function PATCH() {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message: "Deprecated. Use /api/admin/users/:id" },
      message: "Deprecated. Use /api/admin/users/:id",
    }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}
