"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useInventory, useAdjustInventory } from "@/hooks/use-inventory";
import { useProducts } from "@/hooks/use-products";
import { useFacilities } from "@/hooks/use-facilities";
import { useRole } from "@/hooks/use-role";
import { cn, getErrorMessage } from "@/lib/utils";
import { Filter, Package, ShieldCheck } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHero } from "@/components/shared/page-hero";
import { RefreshButton } from "@/components/shared/refresh-button";
import { toast } from "sonner";

const statusTone: Record<
  string,
  { label: string; variant: "destructive" | "secondary" | "outline" | "default"; className?: string }
> = {
  critical: { label: "Critical", variant: "destructive" },
  low: { label: "Low", variant: "secondary", className: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-50" },
  ok: { label: "OK", variant: "outline", className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-50" },
  excess: { label: "Excess", variant: "outline", className: "border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-50" },
};

function statusBadge(status: string | undefined) {
  const tone = status ? statusTone[status] : undefined;
  if (!tone) return <Badge variant="secondary">OK</Badge>;
  return (
    <Badge variant={tone.variant} className={cn("px-2 text-xs", tone.className)}>
      {tone.label}
    </Badge>
  );
}

export default function InventoryPage() {
  const [productFilter, setProductFilter] = useState<string>("");
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, isError, error, refetch, isFetching } = useInventory();
  const { data: products } = useProducts();
  const { data: facilities } = useFacilities();
  const adjust = useAdjustInventory();
  const { role } = useRole();
  const canAdjust = role === "admin" || role === "supply_planner" || role === "demand_planner";

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (productFilter) rows = rows.filter((row) => row.product_id === productFilter);
    if (facilityFilter) rows = rows.filter((row) => row.facility_id === facilityFilter);
    if (statusFilter) rows = rows.filter((row) => row.status === statusFilter);
    return rows;
  }, [data, productFilter, facilityFilter, statusFilter]);

  const productOptions = useMemo(
    () => [
      { value: "", label: "All products" },
      ...(products ?? []).map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
    ],
    [products]
  );

  const facilityOptions = useMemo(
    () => [
      { value: "", label: "All facilities" },
      ...(facilities ?? []).map((f) => ({ value: f.id, label: `${f.name} (${f.location})` })),
    ],
    [facilities]
  );

  const productMap = useMemo(() => new Map(products?.map((p) => [p.id, p]) ?? []), [products]);
  const facilityMap = useMemo(() => new Map(facilities?.map((f) => [f.id, f]) ?? []), [facilities]);
  const chartData = useMemo(
    () =>
      (data ?? []).map((row) => ({
        status: row.status ?? "ok",
        count: 1,
      })),
    [data]
  );

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
        {getErrorMessage(error, "Failed to load inventory.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Inventory"
        description="Visibility into stock by product and facility."
        pill={{ label: "Inventory live" }}
        badges={["Critical <50% safety", "Excess >3× reorder"]}
        actions={
          <>
            <RefreshButton
              onClick={() => void refetch()}
              loading={isFetching}
              tooltip="Reload inventory"
              buttonProps={{ className: "bg-primary/5 text-primary border-primary/20" }}
            />
            <Button size="sm" variant="secondary" disabled>
              Export (coming soon)
            </Button>
          </>
        }
        variant="slate"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filters
          </CardTitle>
          <CardDescription>Slice by product, facility, or status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <FilterSelect value={productFilter} onChange={(v) => setProductFilter(v ?? "")} options={productOptions} placeholder="All products" />
          <FilterSelect value={facilityFilter} onChange={(v) => setFacilityFilter(v ?? "")} options={facilityOptions} placeholder="All facilities" />
          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v ?? "")}
            options={[
              { value: "", label: "All statuses" },
              { value: "critical", label: "Critical" },
              { value: "low", label: "Low" },
              { value: "ok", label: "OK" },
              { value: "excess", label: "Excess" },
            ]}
            placeholder="All statuses"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Inventory health snapshot
          </CardTitle>
          <CardDescription>Status mix across all rows.</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ChartContainer
              id="inventory-health-chart"
              config={{
                count: { label: "Count", color: "var(--chart-3)" },
                status: { label: "Status" },
              }}
              aria-label="Bar chart of inventory health status counts"
              className="h-full"
            >
              <BarChart data={["critical", "low", "ok", "excess"].map((status) => ({
                status,
                count: chartData.filter((c) => c.status === status).length,
              }))}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <ChartLegend />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-medium">Inventory levels</CardTitle>
              <CardDescription>Real-time on hand vs thresholds.</CardDescription>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex items-center gap-1 text-[11px]">
              <ShieldCheck className="h-3 w-3" /> RLS enforced
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>Reorder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const product = productMap.get(row.product_id);
                const facility = facilityMap.get(row.facility_id);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {product?.name ?? row.product_id}
                      <div className="text-xs text-muted-foreground">{product?.sku}</div>
                    </TableCell>
                    <TableCell>
                      {facility?.name ?? row.facility_id}
                      <div className="text-xs text-muted-foreground">{facility?.location}</div>
                    </TableCell>
                    <TableCell>{row.quantity_on_hand}</TableCell>
                    <TableCell>{row.safety_stock_qty}</TableCell>
                  <TableCell>{row.reorder_point}</TableCell>
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell className="text-right">
                    <AdjustInline
                      id={row.id}
                      onAdjust={async (delta, reason) => {
                        await adjust.mutateAsync({ id: row.id, input: { delta_qty: delta, reason } });
                      }}
                      isLoading={adjust.isPending}
                      disabled={!canAdjust}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No inventory records found.
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

function AdjustInline({
  id,
  onAdjust,
  isLoading,
  disabled = false,
}: {
  id: string;
  onAdjust: (delta: number, reason: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmedReason = reason.trim();
    if (!Number.isFinite(delta) || delta === 0) {
      const msg = "Enter a non-zero adjustment.";
      setLocalError(msg);
      toast.error(msg);
      return;
    }
    if (!trimmedReason) {
      const msg = "Reason is required.";
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLocalError(null);
      await onAdjust(delta, trimmedReason);
      toast.success("Inventory adjusted");
      setDelta(0);
      setReason("");
    } catch (error) {
      const message = getErrorMessage(error, "Adjustment failed.");
      setLocalError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-2">
        <Input
          className="w-24"
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          aria-label={`Adjust quantity for ${id}`}
          disabled={disabled}
          step={1}
        />
        <Input
          className="w-40"
          placeholder="Reason"
          value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={disabled}
      />
          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            loading={isLoading}
            loadingText="Saving..."
            disabled={disabled}
          >
            Apply
          </Button>
      </div>
      {localError && <p className="text-[11px] text-destructive">{localError}</p>}
    </div>
  );
}
