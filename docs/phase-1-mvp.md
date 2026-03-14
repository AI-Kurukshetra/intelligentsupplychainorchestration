# Phase 1 — MVP

> Goal: Get planners logging in, seeing real data, and acting on exceptions within the first week.
> This phase establishes the foundation: auth, RBAC, master data, demand forecasting, inventory visibility, and exception management.

---

## Why Phase 1 First

Without auth, roles, and core data visibility, nothing else can be built. Demand forecasting and inventory visibility are the two highest-value features for immediate planner adoption — they replace spreadsheet-based workflows. Exception management closes the loop: planners see problems and can act.

---

## Features in This Phase

| Feature | Priority | Key Outcome |
|---|---|---|
| User authentication | P0 | Secure login with email/password and email verification |
| RBAC & role management | P0 | Role enforcement at route, API, and DB level |
| Dashboard shell | P0 | Role-aware layout, sidebar nav, responsive shell |
| Master data management | P0 | Products, suppliers, facilities, BOMs — full CRUD |
| Demand forecasting engine | P0 | Input historical demand, view baseline forecast, manual override |
| Inventory visibility | P0 | Per-product stock levels, safety stock alerts, status indicators |
| Real-time exception management | P0 | Detect supply/demand imbalances, alert planners, assign and resolve |
| KPI summary dashboard | P1 | Top-level metrics: forecast accuracy, inventory turns, open exceptions |
| User profile | P1 | View/edit display name, see role badge |

---

## Feature Specs

### 1. User Authentication

**What it does:** Email/password sign-up with email verification. Session management via Supabase Auth.

**Routes:**
- `app/auth/sign-in/page.tsx` — sign in form
- `app/auth/sign-up/page.tsx` — sign up form
- `app/auth/callback/route.ts` — Supabase email verification callback

**API routes:**
- `GET /api/auth/me` — returns `{ id, email, display_name, role, supplier_id }`

**DB tables:** `auth.users` (Supabase managed), `profiles`

**Key rules:**
- On sign-up, auto-create a `profiles` row with `role = 'viewer'` via Supabase trigger or API.
- Admin manually upgrades role after verification.
- Middleware redirects unauthenticated users to `/auth/sign-in`.

---

### 2. RBAC & Role Management

**What it does:** Enforces five roles (admin, supply_planner, demand_planner, supplier, viewer) at route, API, and DB level.

**Routes:**
- `app/admin/users/page.tsx` — Admin-only: list users, change roles, deactivate

**API routes:**
- `GET /api/admin/users` — list all profiles (admin only)
- `PATCH /api/admin/users/[id]` — update role or deactivate (admin only)

**DB tables:** `profiles`

**Key rules:**
- See `docs/rbac.md` for full implementation patterns.
- `supplier_id` on profile must be set when assigning supplier role.
- Role can only be changed by admin.

---

### 3. Dashboard Shell

**What it does:** Main app layout with sidebar navigation filtered by role, header, and content area.

**Routes:**
- `app/dashboard/layout.tsx` — authenticated layout wrapper
- `app/dashboard/page.tsx` — landing page (redirects to KPI summary)

**Components:**
- `components/shared/sidebar.tsx` — role-filtered nav using `NAV_ITEMS` from `constants/nav.ts`
- `components/shared/header.tsx` — user avatar, role badge, sign out

**Key rules:**
- Supplier role redirects to `/supplier-portal` instead of `/dashboard`.
- Use shadcn `Sheet` for mobile sidebar.
- All dashboard pages use client-side rendering (see AGENTS.md rule 3).

---

### 4. Master Data Management

**What it does:** CRUD for the core reference data that all planning features depend on: products, suppliers, facilities, bills of materials (BOMs).

**Routes:**
- `app/admin/master-data/products/page.tsx`
- `app/admin/master-data/suppliers/page.tsx`
- `app/admin/master-data/facilities/page.tsx`
- `app/admin/master-data/boms/page.tsx`

**API routes:**
- `GET/POST /api/products`
- `GET/PATCH/DELETE /api/products/[id]`
- `GET/POST /api/suppliers`
- `GET/PATCH/DELETE /api/suppliers/[id]`
- `GET/POST /api/facilities`
- `GET/POST /api/boms`
- `GET/PATCH/DELETE /api/boms/[id]`

**DB tables:**

```sql
products (id, sku, name, description, unit_of_measure, lead_time_days, created_at)
suppliers (id, name, contact_email, contact_name, country, status, created_at)
facilities (id, name, type, location, capacity_units, created_at)
boms (id, parent_product_id, component_product_id, quantity, unit_of_measure)
```

**Access:** Admin and planners can CRUD. Viewer is read-only.

---

### 5. Demand Forecasting Engine

**What it does:** Planners input or import historical demand data per product. System generates a baseline statistical forecast (simple moving average for MVP). Demand planners can apply manual overrides.

**Routes:**
- `app/planning/demand/page.tsx` — forecast list by product
- `app/planning/demand/[productId]/page.tsx` — detail view: historical data, forecast line chart, override form

**API routes:**
- `GET /api/demand/forecasts` — list forecasts (filterable by product, period)
- `POST /api/demand/forecasts` — create/update forecast for a product+period
- `GET /api/demand/history` — historical demand records
- `POST /api/demand/history` — add historical demand entry
- `POST /api/demand/forecasts/[id]/override` — apply manual override with reason

**DB tables:**

```sql
demand_history (id, product_id, period_start, period_end, quantity, source, created_at)
demand_forecasts (id, product_id, period_start, period_end, forecast_qty, override_qty, override_reason, created_by, created_at)
```

**Access:** Demand Planner and Admin can create/override. Supply Planner and Viewer read-only.

**Key rules:**
- Forecast = override_qty if set, else forecast_qty.
- MVP algorithm: 3-period moving average on demand_history. No external AI model needed.
- Chart: use recharts line chart — historical (solid) vs. forecast (dashed).

---

### 6. Inventory Visibility

**What it does:** Shows current stock levels per product and facility. Highlights safety stock breaches (stockout risk) and excess inventory.

**Routes:**
- `app/inventory/page.tsx` — inventory table with filters (product, facility, status)
- `app/inventory/[productId]/page.tsx` — product detail: inventory by facility, trend

**API routes:**
- `GET /api/inventory` — list inventory levels (filterable)
- `PATCH /api/inventory/[id]` — update stock level (manual adjustment)
- `GET /api/inventory/alerts` — items below safety stock or flagged as excess

**DB tables:**

```sql
inventory_levels (id, product_id, facility_id, quantity_on_hand, safety_stock_qty, reorder_point, last_updated)
inventory_adjustments (id, inventory_level_id, delta_qty, reason, adjusted_by, created_at)
```

**Status logic (computed, not stored):**
- `critical` — quantity_on_hand < safety_stock_qty * 0.5
- `low` — quantity_on_hand < safety_stock_qty
- `ok` — quantity_on_hand >= safety_stock_qty and <= reorder_point * 2
- `excess` — quantity_on_hand > reorder_point * 3

**Access:** All internal roles can view. Planners and Admin can adjust.

---

### 7. Exception Management

**What it does:** System auto-detects supply/demand imbalances and inventory issues, creates exception records, and notifies planners. Planners can assign, comment, resolve, or escalate exceptions.

**Routes:**
- `app/exceptions/page.tsx` — exception queue (filterable by type, severity, status, assignee)
- `app/exceptions/[id]/page.tsx` — exception detail: context, comments, action history

**API routes:**
- `GET /api/exceptions` — list exceptions
- `POST /api/exceptions` — create exception (system or manual)
- `PATCH /api/exceptions/[id]` — update status, assignee
- `POST /api/exceptions/[id]/comments` — add comment

**DB tables:**

```sql
exceptions (
  id, type, severity, status, title, description,
  related_product_id, related_facility_id,
  assigned_to, created_at, resolved_at
)
exception_comments (id, exception_id, author_id, content, created_at)
```

**Exception types:** `stockout_risk`, `excess_inventory`, `demand_spike`, `supply_gap`, `supplier_delay`, `forecast_miss`

**Severity levels:** `critical`, `high`, `medium`, `low`

**Status flow:** `open` → `in_review` → `resolved` / `escalated`

**Auto-detection triggers (run as Supabase Edge Function or cron):**
- Inventory below safety stock → `stockout_risk`
- Inventory above excess threshold → `excess_inventory`
- Forecast deviation > 20% from prior period → `demand_spike` or `forecast_miss`

**Access:** Planners and Admin can create, assign, resolve. Viewer read-only.

---

### 8. KPI Summary Dashboard

**What it does:** High-level overview page showing key supply chain health metrics.

**Route:** `app/dashboard/page.tsx`

**Metrics to display:**
- Forecast accuracy (%) — `1 - MAE/actual` across last 30 days
- Open exceptions count by severity
- Inventory health — % of products in `ok` vs `low`/`critical` status
- On-time delivery rate (placeholder — linked in Phase 3)

**API routes:**
- `GET /api/analytics/kpi-summary` — returns aggregated metrics object

**Components:**
- shadcn `Card` tiles for each metric
- recharts `BarChart` for exception breakdown by type
- Status badges with semantic color coding

**Access:** All internal roles (read-only for all).

---

## DB Migration Order

Run in this order to respect foreign keys:

1. `profiles`
2. `products`
3. `suppliers`
4. `facilities`
5. `boms`
6. `demand_history`
7. `demand_forecasts`
8. `inventory_levels`
9. `inventory_adjustments`
10. `exceptions`
11. `exception_comments`

---

## Folder Structure (Phase 1)

```
src/
  app/
    auth/                        # sign-in, sign-up, callback
    dashboard/                   # shell layout + KPI page
    planning/demand/             # forecasting pages
    inventory/                   # inventory visibility pages
    exceptions/                  # exception queue + detail
    admin/
      users/                     # user & role management
      master-data/               # products, suppliers, facilities, BOMs
    api/
      auth/me/
      products/
      suppliers/
      facilities/
      boms/
      demand/
      inventory/
      exceptions/
      analytics/
      admin/users/
  hooks/
    use-auth.ts
    use-products.ts
    use-suppliers.ts
    use-demand-forecasts.ts
    use-inventory.ts
    use-exceptions.ts
  types/
    schemas/
      product.schema.ts
      supplier.schema.ts
      demand-forecast.schema.ts
      inventory.schema.ts
      exception.schema.ts
```

---

## Phase 1 Exit Criteria

- [ ] All 5 roles can log in and see role-appropriate UI.
- [ ] Admin can manage users and change roles.
- [ ] Master data (products, suppliers, facilities, BOMs) is fully CRUD.
- [ ] Demand planner can input historical data and view a baseline forecast.
- [ ] Inventory levels are visible with status indicators (critical/low/ok/excess).
- [ ] Exceptions are auto-detected for inventory issues and surfaced in the queue.
- [ ] KPI dashboard shows forecast accuracy, open exceptions, and inventory health.
- [ ] All API routes use `requireRole`, Zod validation, `sendSuccess`/`sendError`.
- [ ] RLS policies enabled on all tables.
- [ ] `docs/api-contracts.md` and `docs/database.md` updated.
