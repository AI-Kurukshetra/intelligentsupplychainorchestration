"use client";

import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "@/components/admin/users/users-table";
import { InviteUserForm } from "@/components/admin/users/invite-user-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Users as UsersIcon } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { PageHero } from "@/components/shared/page-hero";

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useUsers();
  const users = data?.data ?? [];
  const total = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const planners = users.filter((u) => u.role === "supply_planner" || u.role === "demand_planner").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load users.")}
      </p>
    );
  }

  if (!users.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground">
            View all users and manage their roles.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Invite user</h2>
            <p className="text-xs text-muted-foreground">
              Admins create users and assign roles. An invite email will be sent.
            </p>
          </div>
          <div className="mt-4">
            <InviteUserForm />
          </div>
        </div>
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Invite a user to create the first account."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Users"
        description="View all users and manage their roles."
        pill={{ label: "Admin" }}
        badges={[
          `Total: ${total}`,
          `Admins: ${admins}`,
          `Planners: ${planners}`,
        ]}
      />

      <div className="rounded-lg border border-border p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Invite user</h2>
          <p className="text-xs text-muted-foreground">
            Admins create users and assign roles. An invite email will be sent.
          </p>
        </div>
        <div className="mt-4">
          <InviteUserForm />
        </div>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
