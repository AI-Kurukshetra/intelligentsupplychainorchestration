export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  EMAIL_VERIFIED: "/auth/email-verified",
  UPDATE_PASSWORD: "/auth/update-password",
  DASHBOARD: "/dashboard",
  PLANNING_DEMAND: "/planning/demand",
  INVENTORY: "/inventory",
  EXCEPTIONS: "/exceptions",
  SUPPLIER_PORTAL: "/supplier-portal",
  ADMIN: "/admin",
  ADMIN_MASTER_DATA: "/admin/master-data",
  ADMIN_PRODUCTS: "/admin/master-data/products",
  ADMIN_SUPPLIERS: "/admin/master-data/suppliers",
  ADMIN_FACILITIES: "/admin/master-data/facilities",
  ADMIN_BOMS: "/admin/master-data/boms",
  PROFILE: "/profile",
} as const;

export type RouteKey = keyof typeof ROUTES;
