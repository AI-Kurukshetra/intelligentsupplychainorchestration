import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ROLES } from "@/constants/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await requireRole([
    ROLES.ADMIN,
    ROLES.SUPPLY_PLANNER,
    ROLES.DEMAND_PLANNER,
    ROLES.VIEWER,
    ROLES.SUPPLIER,
  ]);
  if (!data) redirect("/auth/sign-in");

  if (data.profile?.role === ROLES.SUPPLIER) {
    redirect("/supplier-portal");
  }

  return (
    <DashboardShell user={data.user} profile={data.profile}>
      {children}
    </DashboardShell>
  );
}
