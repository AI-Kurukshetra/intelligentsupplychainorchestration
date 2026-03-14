import type React from "react";
import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  Shield,
  User,
  Factory,
  Boxes,
  LineChart,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Roles that can see this item. Empty = all authenticated. */
  roles?: Role[];
  group?: "dashboard" | "planning" | "operations" | "admin" | "profile";
}

/**
 * Sidebar navigation config. Items are shown when user's role is in `roles`.
 * Omit `roles` to show to everyone (admin + user).
 */
export const sidebarNav: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["admin", "supply_planner", "demand_planner", "viewer"],
    group: "dashboard",
  },
  {
    label: "Demand Planning",
    href: ROUTES.PLANNING_DEMAND,
    icon: LineChart,
    roles: ["admin", "demand_planner", "supply_planner"],
    group: "planning",
  },
  {
    label: "Inventory",
    href: ROUTES.INVENTORY,
    icon: Boxes,
    roles: ["admin", "demand_planner", "supply_planner", "viewer"],
    group: "operations",
  },
  {
    label: "Exceptions",
    href: ROUTES.EXCEPTIONS,
    icon: AlertTriangle,
    roles: ["admin", "demand_planner", "supply_planner", "viewer"],
    group: "operations",
  },
  {
    label: "Admin",
    href: ROUTES.ADMIN,
    icon: Shield,
    roles: ["admin"],
    group: "admin",
  },
  {
    label: "Master Data",
    href: ROUTES.ADMIN_MASTER_DATA,
    icon: ClipboardList,
    roles: ["admin", "supply_planner", "demand_planner"],
    group: "admin",
  },
  {
    label: "Products",
    href: ROUTES.ADMIN_PRODUCTS,
    icon: Factory,
    roles: ["admin", "supply_planner", "demand_planner"],
    group: "admin",
  },
  {
    label: "Suppliers",
    href: ROUTES.ADMIN_SUPPLIERS,
    icon: Factory,
    roles: ["admin", "supply_planner", "demand_planner"],
    group: "admin",
  },
  {
    label: "Facilities",
    href: ROUTES.ADMIN_FACILITIES,
    icon: Factory,
    roles: ["admin", "supply_planner", "demand_planner"],
    group: "admin",
  },
  {
    label: "BOMs",
    href: ROUTES.ADMIN_BOMS,
    icon: ClipboardList,
    roles: ["admin", "supply_planner", "demand_planner"],
    group: "admin",
  },
  {
    label: "Users",
    href: `${ROUTES.ADMIN}/users`,
    icon: Shield,
    roles: ["admin"],
    group: "admin",
  },
];

export const sidebarNavFooter: NavItem[] = [
  {
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
    roles: ["admin", "supply_planner", "demand_planner", "supplier", "viewer"],
  },
];

export function getVisibleNavItems(
  items: NavItem[],
  userRole: Role
): NavItem[] {
  return items.filter(
    (item) => !item.roles || item.roles.length === 0 || item.roles.includes(userRole)
  );
}

export const groupOrder: NavItem["group"][] = [
  "dashboard",
  "planning",
  "operations",
  "admin",
];

export function groupedNav(items: NavItem[]) {
  return items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.group ?? "dashboard";
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}
