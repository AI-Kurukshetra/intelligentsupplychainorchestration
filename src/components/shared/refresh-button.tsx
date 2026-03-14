"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type RefreshButtonProps = {
  onClick?: ComponentProps<"button">["onClick"];
  label?: string;
  loading?: boolean;
  tooltip?: string;
  className?: string;
  buttonProps?: ComponentProps<typeof Button>;
  children?: ReactNode;
};

export function RefreshButton({
  onClick,
  label = "Refresh",
  loading = false,
  tooltip,
  className,
  buttonProps,
  children,
}: RefreshButtonProps) {
  const btn = (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2 rounded-md border-border/80 bg-background/60 text-foreground shadow-sm hover:border-border hover:bg-muted/60", className)}
      onClick={onClick}
      disabled={loading}
      title={tooltip}
      {...buttonProps}
    >
      {children ?? (
        <>
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          <span>{loading ? "Refreshing..." : label}</span>
        </>
      )}
    </Button>
  );

  return btn;
}
