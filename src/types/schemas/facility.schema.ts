import { z } from "zod";

export const facilityBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  type: z.string().min(1, "Type is required").max(80),
  location: z.string().min(1, "Location is required").max(200),
  capacity_units: z.number().int().nonnegative("Capacity must be 0 or more"),
});

export const facilityCreateSchema = facilityBaseSchema;
export const facilityUpdateSchema = facilityBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update." }
);

export type FacilityCreateInput = z.infer<typeof facilityCreateSchema>;
export type FacilityUpdateInput = z.infer<typeof facilityUpdateSchema>;
