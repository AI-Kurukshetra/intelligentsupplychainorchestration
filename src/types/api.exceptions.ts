export interface Exception {
  id: string;
  type: "stockout_risk" | "excess_inventory" | "demand_spike" | "supply_gap" | "supplier_delay" | "forecast_miss";
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_review" | "resolved" | "escalated";
  title: string;
  description: string | null;
  related_product_id: string | null;
  related_facility_id: string | null;
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ExceptionComment {
  id: string;
  exception_id: string;
  author_id: string;
  content: string;
  created_at: string;
}
