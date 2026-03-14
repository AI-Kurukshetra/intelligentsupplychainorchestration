"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ContentContainer } from "@/components/shared/content-container";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LayoutBreadcrumbs } from "@/components/layout/breadcrumbs";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PanelLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

type DashboardShellProps = {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
};

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const initial = (profile?.display_name || user.email || "U")
    .slice(0, 1)
    .toUpperCase();
  const role = (profile?.role ?? "viewer") as Role;
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden">
      <AppSidebar userRole={role} collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggle}
              title="Toggle navigation"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <LayoutBreadcrumbs />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="h-6 border-border/60 bg-muted/60 px-2 text-[11px] font-semibold uppercase">
                  {role}
                </Badge>
                <span className="truncate">
                  {profile?.display_name ?? user.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={user.email ?? ""} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {profile?.display_name || user.email}
                </div>
                <div className="px-2 py-1 text-muted-foreground text-xs">{user.email}</div>
                <DropdownMenuItem>
                  <Link href={ROUTES.PROFILE} className="block w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut();
                    }}
                    className="w-full cursor-pointer text-left"
                  >
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <ContentContainer>{children}</ContentContainer>
        </main>
      </div>
    </div>
  );
}
