import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ROLES } from "@/constants/roles";

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await requireRole([
    ROLES.ADMIN,
    ROLES.SUPPLY_PLANNER,
    ROLES.DEMAND_PLANNER,
    ROLES.VIEWER,
  ]);
  if (!data) redirect("/auth/sign-in");
  return <DashboardShell user={data.user} profile={data.profile}>{children}</DashboardShell>;
}

