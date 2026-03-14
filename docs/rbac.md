# RBAC Reference

- Roles: `admin`, `supply_planner`, `demand_planner`, `supplier`, `viewer`.
- Storage: `profiles.role` column.
- Allowed paths (Phase 1):
  - `/dashboard`, `/planning/*`, `/inventory/*`, `/exceptions/*` → admin, supply_planner, demand_planner, viewer (suppliers redirected to `/supplier-portal`).
  - `/admin/*` → admin only.
  - `/profile/*` → all authenticated roles.
  - `/supplier-portal` → supplier.
- Enforcement layers:
  - Middleware (`src/lib/supabase/middleware.ts`) redirects unauthenticated users to `/auth/sign-in` and suppliers away from dashboard to `/supplier-portal` via layout.
  - Server helpers: `requireAuth`, `requireRole` (`src/lib/auth.ts`).
  - API: every protected route must call `requireRole` with allowed roles.
  - DB: RLS on tables (Phase 1 tables to be added) must mirror the same role allowances.

