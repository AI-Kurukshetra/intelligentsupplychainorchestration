import { z } from "zod";

export const supplierBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  contact_email: z.string().email("Enter a valid email").max(160),
  contact_name: z.string().min(1, "Contact name is required").max(160),
  country: z.string().min(1, "Country is required").max(80),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const supplierCreateSchema = supplierBaseSchema;
export const supplierUpdateSchema = supplierBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update." }
);

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
