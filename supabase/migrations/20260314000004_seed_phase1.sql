-- Phase 1 seed data (idempotent)
-- Inserts sample master data, planning, inventory, and exceptions so the UI has meaningful records.

-- Products
insert into public.products (sku, name, description, unit_of_measure, lead_time_days)
values
  ('SKU-100', 'Planner Pro Laptop', '14-inch productivity laptop', 'ea', 28),
  ('SKU-200', 'Logistics Backpack', 'Rugged field backpack', 'ea', 14),
  ('SKU-300', 'Thermal Label Roll', '4x6 thermal labels', 'roll', 7)
on conflict (sku) do nothing;

-- Suppliers
insert into public.suppliers (name, contact_email, contact_name, country, status)
values
  ('Northwind Electronics', 'ops@northwind.example', 'Alex Chen', 'USA', 'active'),
  ('Globex Industrial', 'sales@globex.example', 'Priya Rao', 'IN', 'active'),
  ('ACME Paper', 'service@acme.example', 'Sam Ortiz', 'MX', 'inactive')
on conflict (name) do nothing;

-- Facilities
insert into public.facilities (name, type, location, capacity_units)
values
  ('DC West', 'distribution_center', 'Los Angeles, USA', 50000),
  ('DC East', 'distribution_center', 'Newark, USA', 45000),
  ('MX Plant', 'factory', 'Monterrey, MX', 30000)
on conflict (name) do nothing;

-- BOMs (SKU-100 assembled from SKU-300 labels for packaging demo)
with
  parent as (select id from public.products where sku = 'SKU-100' limit 1),
  component as (select id from public.products where sku = 'SKU-300' limit 1)
insert into public.boms (parent_product_id, component_product_id, quantity, unit_of_measure)
select parent.id, component.id, 1, 'roll'
from parent, component
on conflict do nothing;

-- Demand history (last 6 periods monthly)
insert into public.demand_history (product_id, period_start, period_end, quantity, source)
select p.id, d.period_start, d.period_end, d.quantity, 'seed'
from public.products p
join (values
  ('SKU-100', '2025-09-01'::date, '2025-09-30'::date, 420),
  ('SKU-100', '2025-10-01', '2025-10-31', 460),
  ('SKU-100', '2025-11-01', '2025-11-30', 440),
  ('SKU-100', '2025-12-01', '2025-12-31', 480),
  ('SKU-100', '2026-01-01', '2026-01-31', 500),
  ('SKU-100', '2026-02-01', '2026-02-28', 520),
  ('SKU-200', '2025-09-01', '2025-09-30', 260),
  ('SKU-200', '2025-10-01', '2025-10-31', 250),
  ('SKU-200', '2025-11-01', '2025-11-30', 270),
  ('SKU-200', '2025-12-01', '2025-12-31', 310),
  ('SKU-200', '2026-01-01', '2026-01-31', 295),
  ('SKU-200', '2026-02-01', '2026-02-28', 305)
) as d(sku, period_start, period_end, quantity)
  on p.sku = d.sku
on conflict do nothing;

-- Forecasts (baseline)
insert into public.demand_forecasts (product_id, period_start, period_end, forecast_qty, override_qty, override_reason)
select p.id, f.period_start, f.period_end, f.forecast_qty, f.override_qty, f.override_reason
from public.products p
join (values
  ('SKU-100', '2026-03-01'::date, '2026-03-31'::date, 510, null, null),
  ('SKU-100', '2026-04-01', '2026-04-30', 515, 540, 'Promo uplift'),
  ('SKU-200', '2026-03-01', '2026-03-31', 315, null, null),
  ('SKU-200', '2026-04-01', '2026-04-30', 320, 300, 'Seasonal pullback')
) as f(sku, period_start, period_end, forecast_qty, override_qty, override_reason)
  on p.sku = f.sku
on conflict do nothing;

-- Inventory levels
insert into public.inventory_levels (product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated)
select p.id, f.id, inv.qoh, inv.safety, inv.reorder, now()
from public.products p
join public.facilities f on f.name = inv.facility
join (values
  ('SKU-100', 'DC West', 620, 400, 500),
  ('SKU-100', 'DC East', 380, 350, 450),
  ('SKU-200', 'DC West', 210, 180, 220),
  ('SKU-200', 'DC East', 260, 180, 220),
  ('SKU-300', 'MX Plant', 900, 600, 700)
) as inv(sku, facility, qoh, safety, reorder)
  on p.sku = inv.sku
on conflict do nothing;

-- Inventory adjustments (sample)
insert into public.inventory_adjustments (inventory_level_id, delta_qty, reason, adjusted_by)
select il.id, adj.delta, adj.reason, null
from public.inventory_levels il
join public.products p on p.id = il.product_id
join public.facilities f on f.id = il.facility_id
join (values
  ('SKU-100', 'DC West', 20, 'Cycle count true-up'),
  ('SKU-200', 'DC East', -15, 'Damaged goods write-off')
) as adj(sku, facility, delta, reason)
  on p.sku = adj.sku and f.name = adj.facility
on conflict do nothing;

-- Exceptions
insert into public.exceptions (type, severity, status, title, description, related_product_id, related_facility_id, assigned_to)
select ex.type, ex.severity, ex.status, ex.title, ex.description, p.id, f.id, null
from (values
  ('stockout_risk', 'critical', 'open', 'Stockout risk – SKU-100 @ DC East', 'On hand below safety stock for next 5 days', 'SKU-100', 'DC East'),
  ('excess_inventory', 'medium', 'in_review', 'Excess inventory – SKU-300 @ MX Plant', 'Label rolls exceed reorder point x3', 'SKU-300', 'MX Plant'),
  ('supplier_delay', 'high', 'open', 'Supplier delay – Northwind', 'POs running 2 weeks late', null, null)
) as ex(type, severity, status, title, description, sku, facility)
left join public.products p on p.sku = ex.sku
left join public.facilities f on f.name = ex.facility
on conflict do nothing;

-- Exception comments
insert into public.exception_comments (exception_id, author_id, content)
select e.id, null, c.content
from public.exceptions e
join (values
  ('Stockout risk – SKU-100 @ DC East', 'Supply planner reviewing replenishment ETA'),
  ('Excess inventory – SKU-300 @ MX Plant', 'Consider transfer to DCs before next run')
) as c(title, content) on e.title = c.title
on conflict do nothing;
