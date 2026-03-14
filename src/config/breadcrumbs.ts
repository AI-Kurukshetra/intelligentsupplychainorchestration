/**
 * Breadcrumb segment config keyed by pathname (exact or prefix).
 * Used by LayoutBreadcrumbs to render nav. Last segment is current page (no href).
 */
export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

/** Path pattern -> segments. First segment typically Dashboard; last is current page. */
const pathSegments: Record<string, BreadcrumbSegment[]> = {
  "/": [{ label: "Home" }],
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],
  "/planning/demand": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Planning" },
    { label: "Demand" },
  ],
  "/planning/demand/": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Planning", href: "/planning/demand" },
    { label: "Demand" },
  ],
  "/inventory": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory" },
  ],
  "/inventory/": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/inventory" },
  ],
  "/exceptions": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Exceptions" },
  ],
  "/exceptions/": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Exceptions", href: "/exceptions" },
  ],
  "/admin": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin" },
  ],
  "/admin/users": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Users" },
  ],
  "/admin/master-data": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Master Data" },
  ],
  "/admin/master-data/products": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Master Data", href: "/admin/master-data" },
    { label: "Products" },
  ],
  "/admin/master-data/suppliers": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Master Data", href: "/admin/master-data" },
    { label: "Suppliers" },
  ],
  "/admin/master-data/facilities": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Master Data", href: "/admin/master-data" },
    { label: "Facilities" },
  ],
  "/admin/master-data/boms": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Master Data", href: "/admin/master-data" },
    { label: "BOMs" },
  ],
  "/profile": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile" },
  ],
  "/supplier-portal": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Supplier Portal" },
  ],
};

/**
 * Returns breadcrumb segments for the given pathname.
 * Matches exact path first, then longest prefix.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathSegments[pathname]) {
    return pathSegments[pathname];
  }
  const sorted = Object.keys(pathSegments)
    .filter((p) => p !== "/" && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length);
  const key = sorted[0];
  const segments = key ? pathSegments[key] : undefined;
  return segments ?? [{ label: pathname.slice(1) || "Home" }];
}
