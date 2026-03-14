# Features

> All planned features for the Supply Chain Orchestration Platform. Each gets a row here and a folder in `features/` when development starts.

---

## Feature Status Legend

| Status        | Meaning                                               |
| ------------- | ----------------------------------------------------- |
| `planned`     | In the backlog, not yet started                       |
| `specced`     | `spec.md` and `design.md` written, ready to implement |
| `in progress` | Currently being built                                 |
| `done`        | Shipped                                               |
| `paused`      | Started but deprioritized                             |

---

## Phase Legend

| Phase | Name          | Goal                                                                  |
| ----- | ------------- | --------------------------------------------------------------------- |
| P1    | MVP           | Auth, visibility, forecasting foundation, exceptions                  |
| P2    | Core Planning | Supply planning, scenario modeling, supplier collaboration, S&OP, MRP |
| P3    | Advanced      | Multi-site, capacity, financial integration, full KPI analytics       |

---

## Feature List

| Feature                              | Phase | Status    | Priority | Notes                                                                   |
| ------------------------------------ | ----- | --------- | -------- | ----------------------------------------------------------------------- |
| User authentication                  | P1    | `planned` | P0       | Supabase Auth, email/password, email verification                       |
| RBAC & role management               | P1    | `planned` | P0       | Admin/Supply Planner/Demand Planner/Supplier/Viewer                     |
| Dashboard shell                      | P1    | `planned` | P0       | Layout, sidebar, role-aware nav                                         |
| User profile                         | P1    | `planned` | P1       | View/edit profile, display name, role badge                             |
| Master data management               | P1    | `planned` | P0       | Products, suppliers, facilities, BOMs — CRUD                            |
| Demand forecasting engine            | P1    | `planned` | P0       | Historical input, baseline forecast, manual override                    |
| Inventory visibility                 | P1    | `planned` | P0       | Current stock levels, safety stock status, per-product view             |
| Real-time exception management       | P1    | `planned` | P0       | Alerts for stockouts, excess, supply gaps; assign/resolve               |
| KPI summary dashboard                | P1    | `planned` | P1       | High-level metrics: forecast accuracy, inventory turns, open exceptions |
| Supply planning module               | P2    | `planned` | P0       | Production/procurement plans linked to demand signals                   |
| Scenario planning & what-if analysis | P2    | `planned` | P0       | Create scenarios, compare outcomes, promote to active plan              |
| Supplier collaboration portal        | P2    | `planned` | P0       | Suppliers update lead times, capacity, confirm POs                      |
| Sales & Operations Planning (S&OP)   | P2    | `planned` | P1       | Rolling planning cycle, demand vs. supply reconciliation                |
| Material Requirements Planning (MRP) | P2    | `planned` | P1       | BOM-based material needs calculation from production plan               |
| Workflow & approval engine           | P2    | `planned` | P2       | Configurable approval flows for plan changes and exceptions             |
| Multi-site planning                  | P3    | `planned` | P0       | Coordinate planning across facilities, warehouses, DCs                  |
| Capacity planning                    | P3    | `planned` | P0       | Resource capacity across manufacturing and logistics                    |
| Full KPI analytics & reporting       | P3    | `planned` | P1       | Drill-down dashboards, trend analysis, exportable reports               |
| Financial planning integration       | P3    | `planned` | P1       | Link supply plans to cost budgets and financial forecasts               |
| Data import/export tools             | P3    | `planned` | P2       | Bulk CSV/Excel import for master data and historical demand             |

---

## Adding a Feature

1. Add a row to the table above.
2. Create `features/<feature-name>/` folder.
3. Write `spec.md`, `design.md`, `tasks.md` using the template in `features/_template/`.
4. Update status to `specced`.

---

## Reference

See `docs/rbac.md` for role-to-feature access matrix.
See `docs/api-contracts.md` for API route definitions per feature.
See `docs/database.md` for table schemas per feature.
