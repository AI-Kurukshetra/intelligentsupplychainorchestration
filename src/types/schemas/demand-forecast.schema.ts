import { z } from "zod";

const periodSchema = z.object({
  period_start: z.string().min(1, "Period start is required"),
  period_end: z.string().min(1, "Period end is required"),
});

export const demandHistoryCreateSchema = z.object({
  product_id: z.string().uuid("Product is required"),
  period_start: z.string().min(1, "Period start is required"),
  period_end: z.string().min(1, "Period end is required"),
  quantity: z.number().nonnegative("Quantity must be >= 0"),
  source: z.string().max(120).optional().or(z.literal("")),
});

export type DemandHistoryCreateInput = z.infer<typeof demandHistoryCreateSchema>;

export const demandForecastCreateSchema = z
  .object({
    product_id: z.string().uuid("Product is required"),
    forecast_qty: z.number().nonnegative().optional(),
  })
  .and(periodSchema);

export type DemandForecastCreateInput = z.infer<typeof demandForecastCreateSchema>;

export const demandForecastOverrideSchema = z.object({
  override_qty: z.number().nonnegative("Override must be >= 0"),
  override_reason: z.string().min(1, "Reason is required").max(240),
});

export type DemandForecastOverrideInput = z.infer<typeof demandForecastOverrideSchema>;
