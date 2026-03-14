"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type RefreshButtonProps = {
  onClick?: ComponentProps<"button">["onClick"];
  label?: string;
  loading?: boolean;
  tooltip?: string;
  className?: string;
  buttonProps?: ButtonProps;
  asChild?: boolean;
  children?: ReactNode;
};

export function RefreshButton({
  onClick,
  label = "Refresh",
  loading = false,
  tooltip,
  className,
  buttonProps,
  asChild = false,
  children,
}: RefreshButtonProps) {
  const btn = (
    <Button
      asChild={asChild}
      variant="outline"
      size="sm"
      className={cn("gap-2 rounded-md border-border/80 bg-background/60 text-foreground shadow-sm hover:border-border hover:bg-muted/60", className)}
      onClick={onClick}
      disabled={loading}
      {...buttonProps}
    >
      {asChild ? (
        children ?? null
      ) : (
        <>
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          <span>{loading ? "Refreshing..." : label}</span>
        </>
      )}
    </Button>
  );

  if (!tooltip) return btn;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
