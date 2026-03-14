"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, type Role } from "@/constants/roles";
import { useUpdateUserRole } from "@/hooks/use-users";
import { useSuppliers } from "@/hooks/use-suppliers";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type RoleSelectProps = {
  userId: string;
  currentRole: Role;
  supplierId: string | null;
};

const roleOptions: { value: Role; label: string }[] = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.SUPPLY_PLANNER, label: "Supply Planner" },
  { value: ROLES.DEMAND_PLANNER, label: "Demand Planner" },
  { value: ROLES.SUPPLIER, label: "Supplier" },
  { value: ROLES.VIEWER, label: "Viewer" },
];

export function RoleSelect({ userId, currentRole, supplierId }: RoleSelectProps) {
  const { mutateAsync, isPending } = useUpdateUserRole();
  const { data: suppliers } = useSuppliers();

  const [roleValue, setRoleValue] = useState<Role>(currentRole);
  const [supplierValue, setSupplierValue] = useState<string>(supplierId ?? "");

  useEffect(() => {
    setRoleValue(currentRole);
  }, [currentRole]);

  useEffect(() => {
    setSupplierValue(supplierId ?? "");
  }, [supplierId]);

  useEffect(() => {
    if (roleValue === ROLES.SUPPLIER && !supplierValue && suppliers?.length) {
      setSupplierValue(suppliers[0].id);
    }
  }, [roleValue, supplierValue, suppliers]);

  const supplierOptions = useMemo(
    () =>
      (suppliers ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [suppliers]
  );

  const handleSave = async () => {
    try {
      await mutateAsync({
        id: userId,
        role: roleValue,
        supplier_id: roleValue === ROLES.SUPPLIER ? supplierValue || null : null,
      });
      toast.success("Role updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update role."));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={roleValue} onValueChange={(val) => setRoleValue(val as Role)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {roleValue === ROLES.SUPPLIER && (
        <Select
          value={supplierValue || "none"}
          onValueChange={(val) => setSupplierValue(val === "none" ? "" : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assign supplier" />
          </SelectTrigger>
          <SelectContent>
            {supplierOptions.length === 0 && <SelectItem value="none">No suppliers</SelectItem>}
            {supplierOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        type="button"
        size="sm"
        variant="outline"
        loading={isPending}
        loadingText="Updating..."
        onClick={handleSave}
      >
        Save
      </Button>
    </div>
  );
}
