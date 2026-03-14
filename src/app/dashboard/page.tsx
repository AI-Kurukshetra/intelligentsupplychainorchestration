"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, BarChart3, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/shared/page-hero";
import { RefreshButton } from "@/components/shared/refresh-button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type KpiSummary = {
  forecast_accuracy: number;
  exceptions: { severity: string; count: number }[];
  inventory_health: { status: string; count: number }[];
};

function useKpiSummary() {
  return useQuery({
    queryKey: ["kpi-summary"],
    queryFn: () => apiGet<KpiSummary>("/analytics/kpi-summary"),
  });
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useKpiSummary();

  const accuracy = data ? Math.round((data.forecast_accuracy ?? 0) * 100) : 0;
  const exceptions = data?.exceptions ?? [];
  const inventoryHealth = data?.inventory_health ?? [];
  const exceptionTotal = exceptions.reduce((sum, e) => sum + e.count, 0);
  const okCount = inventoryHealth.find((i) => i.status === "ok")?.count ?? 0;
  const invTotal = inventoryHealth.reduce((sum, i) => sum + i.count, 0);
  const inventoryHealthPct = invTotal ? Math.round((okCount / invTotal) * 100) : 0;

  const metrics = [
    {
      label: "Forecast accuracy",
      value: isLoading || isError ? "—" : `${accuracy}%`,
      helper: "Last 30 days",
      icon: TrendingUp,
      tone: "success" as const,
      accent: "bg-primary/10 text-primary ring-1 ring-primary/20",
    },
    {
      label: "Open exceptions",
      value: isLoading || isError ? "—" : exceptionTotal.toString(),
      helper: "Across severities",
      icon: AlertTriangle,
      tone: "warning" as const,
      accent: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-100",
    },
    {
      label: "Inventory health",
      value: isLoading || isError ? "—" : `${inventoryHealthPct}% OK`,
      helper: "Products in OK status",
      icon: CheckCircle2,
      tone: "muted" as const,
      accent: "bg-accent/20 text-accent-foreground ring-1 ring-accent/30",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        title="Operations Control Center"
        description="Control tower for supply chain health: forecast accuracy, exception load, and inventory posture."
        pill={{ label: "Live" }}
        badges={["Forecasts", "Inventory", "Exceptions"]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isLoading ? "Loading…" : `Updated ${dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "—"}`}
            </Badge>
            <RefreshButton onClick={() => refetch()} loading={isFetching} />
          </div>
        }
        variant="slate"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Key metrics</h2>
          <p className="text-muted-foreground text-sm">Snapshot of the last 30 days and current queue.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((tile) => (
            <Card key={tile.label}>
              <CardHeader className="space-y-1 pb-2">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", tile.accent)}>
                    {tile.icon ? <tile.icon className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold">{tile.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{tile.helper}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-semibold">{tile.value}</div>
                  {tile.tone === "success" && <Badge variant="outline" className="text-[11px]">Target ≥ 90%</Badge>}
                  {tile.tone === "warning" && <Badge variant="secondary" className="text-[11px]">Monitor</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Exceptions by severity</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {exceptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exception data yet.</p>
            ) : (
              <ChartContainer
                id="exceptions-chart"
                config={{
                  count: { label: "Count", color: "var(--chart-1)" },
                  severity: { label: "Severity" },
                }}
                aria-label="Bar chart of exceptions by severity"
                className="h-full"
              >
                <BarChart data={exceptions}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="severity" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" fill="var(--color-count, var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <ChartLegend />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inventory health</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {inventoryHealth.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inventory health data yet.</p>
            ) : (
              <ChartContainer
                id="inventory-chart"
                config={{
                  count: { label: "Count", color: "var(--chart-3)" },
                  status: { label: "Status" },
                }}
                aria-label="Bar chart of inventory health statuses"
                className="h-full"
              >
                <BarChart data={inventoryHealth}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" fill="var(--color-count, var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <ChartLegend />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
