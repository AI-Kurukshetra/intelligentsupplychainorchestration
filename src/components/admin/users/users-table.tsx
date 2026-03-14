"use client";

import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { UserListItem } from "@/types/api";
import { RoleSelect } from "@/components/admin/users/role-select";
import { ROLES, type Role } from "@/constants/roles";
import { useResetUserPassword } from "@/hooks/use-users";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type UsersTableProps = {
  users: UserListItem[];
};

export function UsersTable({ users }: UsersTableProps) {
  const { mutateAsync: resetPassword, isPending } = useResetUserPassword();

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Supplier ID</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email ?? "—"}</TableCell>
              <TableCell>{user.display_name ?? "—"}</TableCell>
              <TableCell>
                <RoleSelect
                  userId={user.id}
                  currentRole={(user.role as Role) ?? ROLES.VIEWER}
                  supplierId={user.supplier_id ?? null}
                />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {user.supplier_id ?? "—"}
              </TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), "yyyy-MM-dd") : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={isPending}
                  loadingText="Sending..."
                  onClick={async () => {
                    try {
                      await resetPassword({ id: user.id });
                      toast.success("Password reset email sent.");
                    } catch (error) {
                      toast.error(
                        getErrorMessage(error, "Failed to send reset email.")
                      );
                    }
                  }}
                >
                  Reset password
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
