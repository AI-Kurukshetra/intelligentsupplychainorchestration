export const ROLES = {
  ADMIN: "admin",
  SUPPLY_PLANNER: "supply_planner",
  DEMAND_PLANNER: "demand_planner",
  SUPPLIER: "supplier",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
