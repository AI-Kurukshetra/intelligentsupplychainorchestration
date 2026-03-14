-- Minimal RBAC schema (remove items)

-- Drop items and related policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'items'
  ) THEN
    DROP TABLE public.items CASCADE;
  END IF;
END $$;

-- Ensure suppliers table exists
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure profiles table exists
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'viewer'
    check (role in ('admin', 'supply_planner', 'demand_planner', 'supplier', 'viewer')),
  supplier_id uuid references public.suppliers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_supplier_role_check
    check (
      (role = 'supplier' and supplier_id is not null)
      or (role <> 'supplier' and supplier_id is null)
    )
);

create index if not exists idx_profiles_role on public.profiles (role);

-- RLS: profiles
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

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

-- RLS: suppliers
alter table public.suppliers enable row level security;

drop policy if exists "suppliers_admin_all" on public.suppliers;

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

-- Trigger: create profile on signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger for profiles/suppliers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();
