import { z } from "zod";
import { ROLES } from "@/constants/roles";

export const updateUserRoleSchema = z
  .object({
    role: z.enum([
      ROLES.ADMIN,
      ROLES.SUPPLY_PLANNER,
      ROLES.DEMAND_PLANNER,
      ROLES.SUPPLIER,
      ROLES.VIEWER,
    ]),
    supplier_id: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.SUPPLIER && !data.supplier_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplier_id"],
        message: "Supplier ID is required for supplier users.",
      });
    }
    if (data.role !== ROLES.SUPPLIER && data.supplier_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplier_id"],
        message: "Supplier ID must be empty for non-supplier roles.",
      });
    }
  });

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;

export const createUserSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    display_name: z.string().min(1, "Display name is required.").max(120),
    role: z.enum([
      ROLES.ADMIN,
      ROLES.SUPPLY_PLANNER,
      ROLES.DEMAND_PLANNER,
      ROLES.SUPPLIER,
      ROLES.VIEWER,
    ]),
    supplier_id: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.SUPPLIER && !data.supplier_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplier_id"],
        message: "Supplier ID is required for supplier users.",
      });
    }
    if (data.role !== ROLES.SUPPLIER && data.supplier_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplier_id"],
        message: "Supplier ID must be empty for non-supplier roles.",
      });
    }
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;
