import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ROLES } from "@/constants/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await requireRole([ROLES.ADMIN, ROLES.SUPPLY_PLANNER, ROLES.DEMAND_PLANNER]);
  if (!data) redirect("/dashboard");

  return (
    <DashboardShell user={data.user} profile={data.profile}>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      </div>
      {children}
    </DashboardShell>
  );
}
