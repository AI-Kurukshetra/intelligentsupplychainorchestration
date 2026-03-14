"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExceptions } from "@/hooks/use-exceptions";
import { getErrorMessage } from "@/lib/utils";
import { AlertTriangle, Filter, Plus } from "lucide-react";
import { FilterSelect } from "@/components/shared/filter-select";
import { RefreshButton } from "@/components/shared/refresh-button";
import { PageHero } from "@/components/shared/page-hero";

const severityBadge = (severity: string) => {
  const map: Record<
    string,
    { label: string; className: string; variant?: "secondary" | "outline" | "destructive" }
  > = {
    critical: { label: "Critical", variant: "destructive", className: "uppercase" },
    high: {
      label: "High",
      variant: "secondary",
      className: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/50 dark:text-amber-50",
    },
    medium: { label: "Medium", variant: "outline", className: "border-border/70 text-foreground" },
    low: {
      label: "Low",
      variant: "outline",
      className: "border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-50",
    },
  };
  const tone = map[severity] ?? map.low;
  return (
    <Badge variant={tone.variant ?? "outline"} className={`px-2 text-[11px] ${tone.className}`}>
      {tone.label}
    </Badge>
  );
};

const statusBadge = (status: string) => {
  const tone: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-destructive/10 text-destructive border-destructive/30" },
    in_review: { label: "In review", className: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-50" },
    resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-50" },
    escalated: { label: "Escalated", className: "bg-primary/10 text-primary border-primary/30" },
  };
  const item = tone[status] ?? tone.open;
  return (
    <Badge variant="outline" className={`px-2 text-[11px] ${item.className}`}>
      {item.label}
    </Badge>
  );
};

export default function ExceptionsPage() {
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } = useExceptions({
    status: status || undefined,
    severity: severity || undefined,
    type: type || undefined,
  });

  const queue = data ?? [];
  const stats = useMemo(() => {
    const open = queue.filter((ex) => ex.status === "open").length;
    const critical = queue.filter((ex) => ex.severity === "critical").length;
    const total = queue.length;
    return { open, critical, total };
  }, [queue]);

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
        {getErrorMessage(error, "Failed to load exceptions.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Exception Triage"
        description="Supply, demand, and inventory risks in a single queue. Assign, resolve, or escalate with full auditability."
        pill={{ label: "Live queue" }}
        badges={[
          `${stats.total} total`,
          `${stats.open} open`,
          `${stats.critical} critical`,
        ]}
        actions={
          <>
            <RefreshButton
              onClick={() => void refetch()}
              loading={isFetching}
              tooltip="Reload queue"
              buttonProps={{ className: "border-primary/30 bg-primary/5 text-primary" }}
            />
            <Button asChild size="sm">
              <Link href="/exceptions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create exception
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filters
            </CardTitle>
            <CardDescription>Slice the queue by state, severity, and type.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">Auto-refresh every load</Badge>
            <RefreshButton
              onClick={() => void refetch()}
              loading={isFetching}
              tooltip="Reload queue"
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <FilterSelect
            value={status}
            onChange={setStatus}
            placeholder="All statuses"
            options={[
              { value: "", label: "All statuses" },
              { value: "open", label: "Open" },
              { value: "in_review", label: "In review" },
              { value: "resolved", label: "Resolved" },
              { value: "escalated", label: "Escalated" },
            ]}
          />
          <FilterSelect
            value={severity}
            onChange={setSeverity}
            placeholder="All severities"
            options={[
              { value: "", label: "All severities" },
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
          <FilterSelect
            value={type}
            onChange={setType}
            placeholder="All types"
            options={[
              { value: "", label: "All types" },
              { value: "stockout_risk", label: "Stockout risk" },
              { value: "excess_inventory", label: "Excess inventory" },
              { value: "demand_spike", label: "Demand spike" },
              { value: "supply_gap", label: "Supply gap" },
              { value: "supplier_delay", label: "Supplier delay" },
              { value: "forecast_miss", label: "Forecast miss" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Exception queue
            </CardTitle>
            <CardDescription>Newest items appear first. Assign and resolve quickly.</CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px]">RLS enforced</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="font-medium">{ex.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ex.type}</TableCell>
                  <TableCell>{severityBadge(ex.severity)}</TableCell>
                  <TableCell>{statusBadge(ex.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/exceptions/${ex.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No exceptions found.
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
