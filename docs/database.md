# Database

## Stack

- **Postgres** hosted on Supabase
- **Migrations** managed via versioned SQL files in `supabase/migrations/`
- **Row Level Security (RLS)** enabled on every table
- **TypeScript types** in `src/types/database.ts` (manual; can be regenerated from Supabase CLI if desired)

---

## Migration Conventions

### File Naming

```
supabase/migrations/
  20250308000001_init_schema.sql
```

Format: `YYYYMMDDHHMMSS_<description>.sql`

### Table Conventions

| Column       | Type         | Notes                    |
| ------------ | ------------ | ------------------------ |
| `id`         | `uuid`       | Default `gen_random_uuid()` where applicable |
| `created_by` | `uuid`       | FK to `auth.users(id)` for user-owned content |
| `created_at` | `timestamptz` | Default `now()`        |
| `updated_at` | `timestamptz` | Managed by trigger     |

- All tables live in the `public` schema.
- Enum-like columns use `text` with a `check` constraint.

---

## Current Schema

### `profiles`

Stores app-level user data including role for RBAC. Row is created on sign-up via `handle_new_user` trigger.

| Column      | Type         | Notes                          |
| ----------- | ------------ | ------------------------------ |
| id          | uuid         | PK, FK to auth.users(id)       |
| email       | text         |                                |
| display_name | text         |                                |
| avatar_url  | text         |                                |
| role        | text         | admin / supply_planner / demand_planner / supplier / viewer; default 'viewer' |
| supplier_id | uuid         | FK suppliers(id); only for role = supplier |
| created_at  | timestamptz  |                                |
| updated_at  | timestamptz  |                                |

### `suppliers`

Suppliers available for supplier-role users.

| Column      | Type         | Notes                    |
| ----------- | ------------ | ------------------------ |
| id          | uuid         | PK                       |
| name        | text         | not null                 |
| created_at  | timestamptz  |                          |
| updated_at  | timestamptz  |                          |

---

## Row Level Security

- **profiles:** Users can read their own; admins can read all. Users can update display_name only; admins can update roles/supplier_id.
- **suppliers:** Admin-only.

### RLS helpers and guards

To avoid recursive policies, admin checks use a security definer helper:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;
```

Role changes are guarded by a trigger so non-admins cannot modify role/supplier_id:

```sql
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
       or new.supplier_id is distinct from old.supplier_id then
      raise exception 'Only admins can change role or supplier_id.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();
```

---

## Useful Queries

```sql
-- All tables with RLS status
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';

-- All policies
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public';
```

## Master Data Tables (Phase 1)
- products (id, sku, name, description, unit_of_measure, lead_time_days, created_at)
- suppliers (id, name, contact_email, contact_name, country, status, created_at)
- facilities (id, name, type, location, capacity_units, created_at)
- boms (id, parent_product_id, component_product_id, quantity, unit_of_measure)
- demand_history (id, product_id, period_start, period_end, quantity, source, created_at)
- demand_forecasts (id, product_id, period_start, period_end, forecast_qty, override_qty, override_reason, created_by, created_at)
- inventory_levels (id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated)
- inventory_adjustments (id, inventory_level_id, delta_qty, reason, adjusted_by, created_at)
- exceptions (id, type, severity, status, title, description, related_product_id, related_facility_id, assigned_to, created_at, resolved_at)
- exception_comments (id, exception_id, author_id, content, created_at)
