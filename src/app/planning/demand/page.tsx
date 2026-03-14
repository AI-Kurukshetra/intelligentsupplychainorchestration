"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { BarChart3, CalendarDays } from "lucide-react";
import { useDemandForecasts } from "@/hooks/use-demand-forecasts";
import { useProducts } from "@/hooks/use-products";
import { getErrorMessage, cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { RefreshButton } from "@/components/shared/refresh-button";
import { PageHero } from "@/components/shared/page-hero";

export default function DemandPlanningPage() {
  const { data: forecasts, isLoading, isError, error, refetch, isFetching } = useDemandForecasts();
  const { data: products } = useProducts();

  const productMap = useMemo(() => new Map(products?.map((p) => [p.id, p]) ?? []), [products]);

  const metrics = useMemo(() => {
    const total = forecasts?.length ?? 0;
    const overrides = forecasts?.filter((f) => f.override_qty != null).length ?? 0;
    const productsCovered = new Set((forecasts ?? []).map((f) => f.product_id)).size;
    const avgEffective =
      forecasts && forecasts.length
        ? Math.round(
            (forecasts.reduce((sum, f) => sum + (f.effective_qty ?? 0), 0) / forecasts.length) * 10
          ) / 10
        : 0;
    return [
      { label: "Products covered", value: productsCovered },
      { label: "Overrides applied", value: overrides },
      { label: "Avg effective qty", value: avgEffective },
      { label: "Forecast rows", value: total },
    ];
  }, [forecasts]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load forecasts.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Demand Planning"
        description="Baseline forecasts with manual overrides per product and period."
        pill={{ label: "Forecasts live" }}
        badges={["History", "Overrides", "Accuracy"]}
        actions={
          <RefreshButton
            onClick={() => void refetch()}
            loading={isFetching}
            tooltip="Reload forecasts"
            buttonProps={{ className: "border-primary/30 bg-primary/5 text-primary" }}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Forecasts by product
            </CardTitle>
            <CardDescription>Baseline vs override quantities by period.</CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px]">
            <CalendarDays className="mr-1 h-3 w-3" />
            Last 4 periods
          </Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Baseline</TableHead>
                <TableHead>Override</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts?.map((f) => {
                const product = productMap.get(f.product_id);
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      {product?.name ?? f.product_id}
                      <div className="text-xs text-muted-foreground">{product?.sku}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{f.period_start}</div>
                      <div className="text-xs text-muted-foreground">to {f.period_end}</div>
                    </TableCell>
                    <TableCell>{f.forecast_qty}</TableCell>
                    <TableCell>
                      {f.override_qty != null ? (
                        <Badge variant="secondary">{f.override_qty}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{f.effective_qty}</TableCell>
                    <TableCell className="text-right">
                    <Link
                      href={`${ROUTES.PLANNING_DEMAND}/${f.product_id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Manage
                    </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!forecasts?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No forecasts yet. Add history on a product to generate a baseline.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
