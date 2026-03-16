import Link from "next/link";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import {
  ArrowRight,
  LayoutDashboard,
  Shield,
  Sparkles,
} from "lucide-react";

const highlights = [
  "Real-time visibility across demand, inventory, and supply",
  "Scenario modeling and exception management",
  "Single-tenant for mid-market manufacturers",
];

type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background md:flex-row">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute right-4 top-4 z-50 md:right-6 md:top-6">
        <ThemeSwitcher />
      </div>

      <aside className="relative z-10 hidden w-full flex-col justify-between border-r border-border/80 bg-muted/30 p-8 md:flex md:max-w-[420px] lg:max-w-[480px] lg:p-12">
        <div className="space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            Supply Chain Control
          </Link>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <LayoutDashboard className="h-8 w-8 shrink-0" />
              <span className="font-display text-xl font-semibold">
                Supply Chain Orchestration
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              One platform for demand, supply, inventory, and exceptions—built
              for planners who need visibility and control.
            </p>
            <ul className="space-y-3">
              {highlights.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0" />
          <span>Single-tenant • Role-based access</span>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 md:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
