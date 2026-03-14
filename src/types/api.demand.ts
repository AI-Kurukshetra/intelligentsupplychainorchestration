export interface DemandHistory {
  id: string;
  product_id: string;
  period_start: string;
  period_end: string;
  quantity: number;
  source: string | null;
  created_at: string;
}

export interface DemandForecast {
  id: string;
  product_id: string;
  period_start: string;
  period_end: string;
  forecast_qty: number;
  override_qty: number | null;
  override_reason: string | null;
  created_by: string | null;
  created_at: string;
  effective_qty: number;
}

