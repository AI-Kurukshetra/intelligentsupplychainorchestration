-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  unit_of_measure text not null,
  lead_time_days integer not null default 0 check (lead_time_days >= 0),
  created_at timestamptz not null default now()
);

-- suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text not null,
  contact_name text not null,
  country text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- facilities
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  location text not null,
  capacity_units integer not null default 0 check (capacity_units >= 0),
  created_at timestamptz not null default now()
);

-- boms
create table if not exists public.boms (
  id uuid primary key default gen_random_uuid(),
  parent_product_id uuid not null references public.products(id) on delete cascade,
  component_product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  unit_of_measure text not null
);

-- demand_history
create table if not exists public.demand_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  quantity numeric not null default 0,
  source text,
  created_at timestamptz not null default now()
);

-- demand_forecasts
create table if not exists public.demand_forecasts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  forecast_qty numeric not null default 0,
  override_qty numeric,
  override_reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- inventory_levels
create table if not exists public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  quantity_on_hand numeric not null default 0,
  safety_stock_qty numeric not null default 0,
  reorder_point numeric not null default 0,
  last_updated timestamptz
);

-- inventory_adjustments
create table if not exists public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  inventory_level_id uuid not null references public.inventory_levels(id) on delete cascade,
  delta_qty numeric not null,
  reason text,
  adjusted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- exceptions
create table if not exists public.exceptions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null,
  status text not null default 'open',
  title text not null,
  description text,
  related_product_id uuid references public.products(id),
  related_facility_id uuid references public.facilities(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- exception_comments
create table if not exists public.exception_comments (
  id uuid primary key default gen_random_uuid(),
  exception_id uuid not null references public.exceptions(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.facilities enable row level security;
alter table public.boms enable row level security;
alter table public.demand_history enable row level security;
alter table public.demand_forecasts enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.exceptions enable row level security;
alter table public.exception_comments enable row level security;

-- Helper role check
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_planner() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','supply_planner','demand_planner')
  );
$$;

create or replace function public.is_viewer() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','supply_planner','demand_planner','viewer')
  );
$$;

-- Policies: read for viewers; write for planners/admins
do $$ begin
  perform 1;
  exception when others then null;
end $$;

-- products
drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (public.is_viewer());
drop policy if exists products_write on public.products;
create policy products_write on public.products for all using (public.is_planner());

-- suppliers
drop policy if exists suppliers_read on public.suppliers;
create policy suppliers_read on public.suppliers for select using (public.is_viewer());
drop policy if exists suppliers_write on public.suppliers;
create policy suppliers_write on public.suppliers for all using (public.is_planner());

-- facilities
drop policy if exists facilities_read on public.facilities;
create policy facilities_read on public.facilities for select using (public.is_viewer());
drop policy if exists facilities_write on public.facilities;
create policy facilities_write on public.facilities for all using (public.is_planner());

-- boms
drop policy if exists boms_read on public.boms;
create policy boms_read on public.boms for select using (public.is_viewer());
drop policy if exists boms_write on public.boms;
create policy boms_write on public.boms for all using (public.is_planner());

-- demand_history
drop policy if exists dh_read on public.demand_history;
create policy dh_read on public.demand_history for select using (public.is_viewer());
drop policy if exists dh_write on public.demand_history;
create policy dh_write on public.demand_history for all using (public.is_planner());

-- demand_forecasts
drop policy if exists df_read on public.demand_forecasts;
create policy df_read on public.demand_forecasts for select using (public.is_viewer());
drop policy if exists df_write on public.demand_forecasts;
create policy df_write on public.demand_forecasts for all using (public.is_planner());

-- inventory_levels
drop policy if exists inv_read on public.inventory_levels;
create policy inv_read on public.inventory_levels for select using (public.is_viewer());
drop policy if exists inv_write on public.inventory_levels;
create policy inv_write on public.inventory_levels for all using (public.is_planner());

-- inventory_adjustments
drop policy if exists inv_adj_read on public.inventory_adjustments;
create policy inv_adj_read on public.inventory_adjustments for select using (public.is_viewer());
drop policy if exists inv_adj_write on public.inventory_adjustments;
create policy inv_adj_write on public.inventory_adjustments for all using (public.is_planner());

-- exceptions
drop policy if exists ex_read on public.exceptions;
create policy ex_read on public.exceptions for select using (public.is_viewer());
drop policy if exists ex_write on public.exceptions;
create policy ex_write on public.exceptions for all using (public.is_planner());

-- exception_comments
drop policy if exists ex_comment_read on public.exception_comments;
create policy ex_comment_read on public.exception_comments for select using (public.is_viewer());
drop policy if exists ex_comment_write on public.exception_comments;
create policy ex_comment_write on public.exception_comments for all using (public.is_planner());

