"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  sidebarNav,
  sidebarNavFooter,
  getVisibleNavItems,
  groupedNav,
  groupOrder,
} from "@/config/nav";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import type { Role } from "@/constants/roles";

type AppSidebarProps = {
  userRole: Role;
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ userRole, collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mainItems = useMemo(() => getVisibleNavItems(sidebarNav, userRole), [userRole]);
  const footerItems = useMemo(() => getVisibleNavItems(sidebarNavFooter, userRole), [userRole]);
  const grouped = useMemo(() => groupedNav(mainItems), [mainItems]);

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-[3.25rem]" : "w-56"
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm">
            SC
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-sidebar-foreground">Supply Chain</div>
              <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/70">
                Control Center
              </div>
            </div>
          )}
        </div>
        <NavList
          groupedItems={grouped}
          footerItems={footerItems}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              collapsed && "w-full"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="inline-flex h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground lg:hidden"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col bg-sidebar">
            <div className="flex items-center gap-3 border-b border-sidebar-border px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm">
                SC
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-sidebar-foreground">Supply Chain</div>
                <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/70">
                  Control Center
                </div>
              </div>
            </div>
            <NavList
              groupedItems={grouped}
              footerItems={footerItems}
              collapsed={false}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

type NavListProps = {
  groupedItems: ReturnType<typeof groupedNav>;
  footerItems: ReturnType<typeof getVisibleNavItems>;
  collapsed: boolean;
  pathname: string;
  onNavigate: () => void;
};

function NavList({ groupedItems, footerItems, collapsed, pathname, onNavigate }: NavListProps) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
        {groupOrder.map((group) => {
          const items = groupedItems[group] ?? [];
          if (!items.length) return null;
          return (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {group}
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-ring/50"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )}
                    onClick={onNavigate}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
      {footerItems.length > 0 && (
        <div className="border-t border-sidebar-border p-2">
          {footerItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-ring/50"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
                onClick={onNavigate}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
