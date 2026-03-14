import { z } from "zod";

export const productBaseSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(64),
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  unit_of_measure: z.string().min(1, "Unit of measure is required").max(16),
  lead_time_days: z.number().int().nonnegative("Lead time must be 0 or more"),
});

export const productCreateSchema = productBaseSchema;

export const productUpdateSchema = productBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update." }
);

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
