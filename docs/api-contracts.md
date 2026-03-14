# API Contracts

> This document is the source of truth for all API routes.
> Update it every time a route is added, changed, or removed.

---

## Conventions

- All routes are prefixed with `/api/`
- All requests and responses use JSON
- Authentication: Supabase session cookie (same-origin; axios client sends credentials)
- **Success format:** `{ success: true, data: T, message?: string, metadata?: { pagination?: {...} } }` — see `src/types/api.ts`
- **Error format:** `{ success: false, error: { code?: string, message: string }, message?: string, details?: unknown }`
- Client uses `apiGet`, `apiPost`, `apiPatch`, `apiDelete` from `src/lib/api/client.ts`; responses are unwrapped to `data` or throw `ApiRequestError`

---

## Auth & Profile

### `GET /api/auth/me`

Returns the authenticated user summary: `{ id, email, display_name, role, supplier_id }`. Use for lightweight auth checks.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string | null",
    "display_name": "string | null",
    "role": "string | null",
    "supplier_id": "uuid | null"
  }
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 500 | Server error |

---

### `GET /api/profile/current`

Returns the current user and profile (id, display_name, avatar_url, role, supplier_id). Used by `useCurrentUser()` and `useRole()`.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "string | null" },
    "profile": {
      "id": "uuid",
      "display_name": "string | null",
      "avatar_url": "string | null",
      "role": "string",
      "supplier_id": "uuid | null"
    } | null
  }
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 500 | Server error |

---

## Admin Users

### `POST /api/admin/users/invite`

Create a user (admin-only) and send a password setup email.

**Request body**
```json
{
  "email": "string (required)",
  "display_name": "string (required)",
  "role": "admin | supply_planner | demand_planner | supplier | viewer",
  "supplier_id": "uuid | null"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string | null",
    "display_name": "string | null",
    "avatar_url": "string | null",
    "role": "string",
    "supplier_id": "uuid | null",
    "created_at": "ISO8601"
  },
  "message": "User invited."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 400 | Validation failed |
| 403 | Forbidden |
| 500 | Server error |

---

### `POST /api/admin/users/:id/reset-password`

Send a password reset email to a user (admin-only).

**Response `200`**
```json
{
  "success": true,
  "data": { "message": "Password reset sent." }
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 403 | Forbidden |
| 404 | User not found |
| 500 | Server error |

### `GET /api/admin/users`

List users/profiles (admin-only).

**Query params**
- `page` (number, default 1)
- `limit` (number, default 20)

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string | null",
      "display_name": "string | null",
      "avatar_url": "string | null",
      "role": "string",
      "supplier_id": "uuid | null",
      "created_at": "ISO8601"
    }
  ],
  "metadata": { "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 } }
}
```

### `PATCH /api/admin/users/:id`

Update a user's role (and supplier mapping). Admin-only.

**Request body**
```json
{
  "role": "admin | supply_planner | demand_planner | supplier | viewer",
  "supplier_id": "uuid | null"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string | null",
    "display_name": "string | null",
    "avatar_url": "string | null",
    "role": "string",
    "supplier_id": "uuid | null",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  },
  "message": "User role updated."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 400 | Validation failed |
| 403 | Forbidden |
| 404 | User not found |
| 500 | Server error |

---

## Master Data

### `GET /api/products`
List products (admin, supply_planner, demand_planner, viewer).

### `POST /api/products`
Create product (admin, supply_planner, demand_planner). Body: `sku, name, description?, unit_of_measure, lead_time_days`.

### `PATCH /api/products/:id`
Update product (admin, supply_planner, demand_planner).

### `DELETE /api/products/:id`
Delete product (admin, supply_planner, demand_planner).

### `GET /api/suppliers`
List suppliers (admin, supply_planner, demand_planner, viewer).

### `POST /api/suppliers`
Create supplier (admin, supply_planner, demand_planner). Body: `name, contact_email, contact_name, country, status`.

### `PATCH /api/suppliers/:id`
Update supplier (admin, supply_planner, demand_planner).

### `DELETE /api/suppliers/:id`
Delete supplier (admin, supply_planner, demand_planner).

### `GET /api/facilities`
List facilities (admin, supply_planner, demand_planner, viewer).

### `POST /api/facilities`
Create facility (admin, supply_planner, demand_planner). Body: `name, type, location, capacity_units`.

### `PATCH /api/facilities/:id`
Update facility (admin, supply_planner, demand_planner).

### `DELETE /api/facilities/:id`
Delete facility (admin, supply_planner, demand_planner).

### `GET /api/boms`
List BOMs (admin, supply_planner, demand_planner, viewer).

### `POST /api/boms`
Create BOM (admin, supply_planner, demand_planner). Body: `parent_product_id, component_product_id, quantity, unit_of_measure`.

### `PATCH /api/boms/:id`
Update BOM (admin, supply_planner, demand_planner).

### `DELETE /api/boms/:id`
Delete BOM (admin, supply_planner, demand_planner).

---

## Demand Planning

### `GET /api/demand/history`
List demand history. Query params: `product_id?`. Auth: admin, supply_planner, demand_planner, viewer.

### `POST /api/demand/history`
Create demand history (admin, demand_planner). Body: `product_id, period_start, period_end, quantity, source?`.

### `GET /api/demand/forecasts`
List forecasts. Query params: `product_id?`. Auth: admin, supply_planner, demand_planner, viewer. Response includes `effective_qty` = `override_qty ?? forecast_qty`.

### `POST /api/demand/forecasts`
Create baseline forecast (admin, demand_planner). Body: `product_id, period_start, period_end, forecast_qty?` (defaults to 3-period moving average of history).

### `POST /api/demand/forecasts/:id/override`
Override a forecast (admin, demand_planner). Body: `override_qty, override_reason`.

---

## Inventory

### `GET /api/inventory`
List inventory levels (admin, supply_planner, demand_planner, viewer). Query params: `product_id?`, `facility_id?`, `status?`.

### `PATCH /api/inventory/:id`
Adjust on-hand quantity (admin, supply_planner, demand_planner). Body: `delta_qty, reason`.

### `GET /api/inventory/alerts`
List items in critical/low/excess status (admin, supply_planner, demand_planner, viewer).

---

## Exceptions

### `GET /api/exceptions`
List exceptions with optional filters `status`, `severity`, `type` (admin, supply_planner, demand_planner, viewer).

### `POST /api/exceptions`
Create exception (admin, supply_planner, demand_planner). Body: `type, severity, title, description?, related_product_id?, related_facility_id?`.

### `GET /api/exceptions/:id`
Get exception detail (admin, supply_planner, demand_planner, viewer).

### `PATCH /api/exceptions/:id`
Update status/assignee/severity (admin, supply_planner, demand_planner).

### `GET /api/exceptions/:id/comments`
List comments (admin, supply_planner, demand_planner, viewer).

### `POST /api/exceptions/:id/comments`
Add comment (admin, supply_planner, demand_planner). Body: `content`.

### `POST /api/exceptions/refresh`
Auto-create exceptions from inventory levels (stockout risk / excess). Admin, supply_planner, demand_planner.

---

## Adding New Routes

When a new API route is implemented, add its contract here. Include:
- HTTP method + path
- Authentication requirement
- Request body (if any)
- Response shape (success and error)
- All possible error status codes
