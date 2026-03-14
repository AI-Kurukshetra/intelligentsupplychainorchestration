# Product

> AI-assisted Supply Chain Orchestration Platform — single-tenant SaaS for mid-market manufacturers.

---

## Problem

Mid-market manufacturers lack real-time visibility and coordinated planning across demand, supply, inventory, and production. Existing tools (ERP modules, spreadsheets) are siloed, reactive, and unable to model trade-offs or respond to disruptions quickly. Planners spend more time firefighting than planning.

---

## Target Users

Single enterprise deployment. Internal users across supply chain, operations, procurement, and finance.

| Role           | Who they are                                                          |
| -------------- | --------------------------------------------------------------------- |
| Admin          | IT/ops admin managing users, config, integrations                     |
| Supply Planner | Plans production schedules, procurement, and capacity                 |
| Demand Planner | Owns forecast accuracy, demand signals, and S&OP inputs               |
| Supplier       | External supplier updating capacity, lead times, and commitments      |
| Viewer         | Executive or stakeholder with read-only access to dashboards and KPIs |

---

## Value Proposition

- One platform replacing fragmented spreadsheet-based planning workflows.
- Real-time visibility across demand, inventory, supply, and exceptions in a single dashboard.
- Scenario modeling to evaluate trade-offs before committing to plans.
- Structured collaboration between internal planners and external suppliers.
- Built on a modern stack (Next.js, Supabase, shadcn/ui) — fast to iterate and easy to extend.

---

## Core User Flows

1. **Auth & Onboarding** — Login, role assignment, profile management.
2. **Demand Forecasting** — Upload/input historical demand, view AI-assisted forecasts, adjust manually.
3. **Inventory Visibility** — View current stock levels, safety stock status, alerts for stockouts or excess.
4. **Exception Management** — Receive alerts for supply/demand imbalances, act on them or escalate.
5. **Supply Planning** — Create and manage production/procurement plans tied to demand signals.
6. **Scenario Planning** — Model what-if scenarios (demand spike, supplier delay) and compare outcomes.
7. **Supplier Collaboration** — Suppliers log in to update lead times, confirm capacity, respond to POs.
8. **S&OP Process** — Align demand and supply plans across a rolling planning cycle.
9. **KPI Dashboards** — Track forecast accuracy, inventory turns, service levels, exception resolution time.

---

## Out of Scope (v1)

- Multi-tenant / org-scoped data isolation.
- OAuth (Google, GitHub) — email/password only.
- Blockchain traceability, AR/VR interfaces, quantum optimization.
- Transportation planning optimization.
- Mobile-native app (responsive web only).

---

## Success Metrics

| Metric                        | Target                             |
| ----------------------------- | ---------------------------------- |
| Setup to first planning run   | < 1 day                            |
| Forecast accuracy improvement | Measurable vs. baseline in 90 days |
| Exception resolution time     | < 4 hours average                  |
| Docs match code               | Always                             |
| Planner adoption              | > 80% weekly active within 60 days |

---

## Notes

- Schemas live in `src/types/schemas/`. API contracts in `docs/api-contracts.md`. Keep both updated when adding routes.
- RBAC is enforced at both route (middleware) and API (requireRole) layers. See `docs/rbac.md`.
- All planning data is scoped to a single organization. No cross-tenant data exposure.
- Supabase RLS policies are the last line of defense — always enable them even with server-side auth checks.
