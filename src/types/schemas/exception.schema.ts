import { z } from "zod";

export const exceptionCreateSchema = z.object({
  type: z.enum([
    "stockout_risk",
    "excess_inventory",
    "demand_spike",
    "supply_gap",
    "supplier_delay",
    "forecast_miss",
  ]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  related_product_id: z.string().uuid().nullable().optional(),
  related_facility_id: z.string().uuid().nullable().optional(),
});

export const exceptionUpdateSchema = z.object({
  status: z.enum(["open", "in_review", "resolved", "escalated"]).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
});

export const exceptionCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export type ExceptionCreateInput = z.infer<typeof exceptionCreateSchema>;
export type ExceptionUpdateInput = z.infer<typeof exceptionUpdateSchema>;
export type ExceptionCommentInput = z.infer<typeof exceptionCommentSchema>;
