-- RBAC and admin user management schema updates

-- Suppliers table
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles: rename + new columns
alter table public.profiles rename column full_name to display_name;

alter table public.profiles
  add column if not exists supplier_id uuid references public.suppliers(id);

-- Role constraints
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'supply_planner', 'demand_planner', 'supplier', 'viewer'));

alter table public.profiles drop constraint if exists profiles_supplier_role_check;
alter table public.profiles
  add constraint profiles_supplier_role_check
  check (
    (role = 'supplier' and supplier_id is not null)
    or (role <> 'supplier' and supplier_id is null)
  );

alter table public.profiles alter column role set default 'viewer';

-- Data cleanup for existing rows
update public.profiles
set role = 'viewer'
where role = 'user' or role is null;

-- RLS: profiles
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and supplier_id is not distinct from (select supplier_id from public.profiles where id = auth.uid())
  );

create policy "profiles_update_admin"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS: suppliers (admin only)
alter table public.suppliers enable row level security;

create policy "suppliers_admin_all"
  on public.suppliers for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- RLS: items (viewer read-only, planners/admin can write)
alter table public.items enable row level security;

drop policy if exists "Items are viewable by authenticated users" on public.items;
drop policy if exists "Authenticated users can create items" on public.items;
drop policy if exists "Users can update own items" on public.items;
drop policy if exists "Users can delete own items" on public.items;
drop policy if exists "Admins can update any item" on public.items;
drop policy if exists "Admins can delete any item" on public.items;

create policy "items_select_internal"
  on public.items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'supply_planner', 'demand_planner', 'viewer')
    )
  );

create policy "items_insert_planners"
  on public.items for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'supply_planner', 'demand_planner')
    )
  );

create policy "items_update_own"
  on public.items for update
  using (
    auth.uid() = created_by
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'supply_planner', 'demand_planner')
    )
  )
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'supply_planner', 'demand_planner')
    )
  );

create policy "items_delete_own"
  on public.items for delete
  using (
    auth.uid() = created_by
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'supply_planner', 'demand_planner')
    )
  );

create policy "items_update_admin_any"
  on public.items for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "items_delete_admin_any"
  on public.items for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger: create profile on signup (display_name + viewer default)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, role, supplier_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name',
             new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'viewer',
    null
  );
  return new;
end;
$$;

-- Updated_at trigger for suppliers
drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();
