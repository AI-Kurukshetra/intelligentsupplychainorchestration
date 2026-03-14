export interface InventoryLevel {
  id: string;
  product_id: string;
  facility_id: string;
  quantity_on_hand: number;
  safety_stock_qty: number;
  reorder_point: number;
  last_updated: string | null;
  status: "critical" | "low" | "ok" | "excess";
}

export interface InventoryAdjustment {
  id: string;
  inventory_level_id: string;
  delta_qty: number;
  reason: string | null;
  adjusted_by: string | null;
  created_at: string;
}

