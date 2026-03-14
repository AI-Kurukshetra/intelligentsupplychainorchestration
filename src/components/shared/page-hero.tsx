"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type PageHeroProps = {
  title: string;
  description?: string;
  pill?: { icon?: LucideIcon; label: string };
  badges?: string[];
  actions?: React.ReactNode;
  variant?: "slate" | "charcoal";
  className?: string;
};

const variantStyles: Record<
  NonNullable<PageHeroProps["variant"]>,
  { gradient: string; overlay: string }
> = {
  slate: {
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--card) 90%, var(--primary) 10%), color-mix(in oklab, var(--card) 82%, var(--accent) 18%))",
    overlay:
      "radial-gradient(circle at 18% 18%, color-mix(in oklab, var(--accent) 26%, transparent) 0%, transparent 28%), " +
      "radial-gradient(circle at 86% 0%, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 30%), " +
      "linear-gradient(0deg, color-mix(in oklab, var(--foreground) 4%, transparent) 0%, transparent 100%)",
  },
  charcoal: {
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--background) 80%, var(--foreground) 20%), color-mix(in oklab, var(--background) 86%, var(--primary) 14%))",
    overlay:
      "radial-gradient(circle at 18% 18%, color-mix(in oklab, var(--muted) 28%, transparent) 0%, transparent 28%), " +
      "radial-gradient(circle at 86% 0%, color-mix(in oklab, var(--primary) 20%, transparent) 0%, transparent 32%), " +
      "linear-gradient(180deg, color-mix(in oklab, var(--foreground) 6%, transparent) 0%, transparent 100%)",
  },
};

export function PageHero({
  title,
  description,
  pill,
  badges = [],
  actions,
  variant = "slate",
  className,
}: PageHeroProps) {
  const palette = variantStyles[variant];
  const PillIcon = pill?.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-md",
        className,
      )}
      style={{ backgroundImage: palette.gradient }}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: palette.overlay }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-black/5 dark:from-white/0 dark:to-black/20" />
      <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          {pill && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {PillIcon && <PillIcon className="h-4 w-4" />}
              {pill.label}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge
                  key={b}
                  variant="outline"
                  className="border-border/70 bg-primary/5 text-xs font-semibold text-foreground"
                >
                  {b}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-background/60 p-2 backdrop-blur">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
