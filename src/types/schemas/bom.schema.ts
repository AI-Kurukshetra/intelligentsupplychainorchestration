import { z } from "zod";

export const bomBaseSchema = z.object({
  parent_product_id: z.string().uuid("Parent product id required"),
  component_product_id: z.string().uuid("Component product id required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit_of_measure: z.string().min(1, "Unit of measure is required").max(16),
});

export const bomCreateSchema = bomBaseSchema;
export const bomUpdateSchema = bomBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update." }
);

export type BomCreateInput = z.infer<typeof bomCreateSchema>;
export type BomUpdateInput = z.infer<typeof bomUpdateSchema>;
