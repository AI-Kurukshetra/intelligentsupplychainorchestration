import { z } from "zod";

export const inventoryAdjustSchema = z.object({
  delta_qty: z.number().finite(),
  reason: z.string().min(1, "Reason is required").max(200),
});

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
