"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useDemandForecasts, useDemandHistory, useCreateDemandHistory, useOverrideForecast } from "@/hooks/use-demand-forecasts";
import { useCreateForecast } from "@/hooks/use-demand-forecasts";
import { useProducts } from "@/hooks/use-products";
import { useRole } from "@/hooks/use-role";
import {
  demandHistoryCreateSchema,
  demandForecastOverrideSchema,
  demandForecastCreateSchema,
  type DemandHistoryCreateInput,
  type DemandForecastOverrideInput,
  type DemandForecastCreateInput,
} from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { Pencil, ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { RefreshButton } from "@/components/shared/refresh-button";
import { PageHero } from "@/components/shared/page-hero";

export default function DemandProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params?.productId;
  const { role } = useRole();
  const canEdit = role === "admin" || role === "demand_planner";

  const { data: productList } = useProducts();
  const product = productList?.find((p) => p.id === productId);

  const { data: history, isLoading: historyLoading, isError: historyError, error: historyErr } =
    useDemandHistory(productId);
  const { data: forecasts, isLoading: forecastLoading, isError: forecastError, error: forecastErr } =
    useDemandForecasts(productId);

  const createHistory = useCreateDemandHistory(productId);
  const overrideForecast = useOverrideForecast(productId);
  const createForecast = useCreateForecast(productId);

  const [overrideId, setOverrideId] = useState<string | null>(null);

  const historyForm = useForm<DemandHistoryCreateInput>({
    resolver: zodResolver(demandHistoryCreateSchema),
    defaultValues: {
      product_id: productId,
      period_start: "",
      period_end: "",
      quantity: 0,
      source: "manual",
    },
  });

  const overrideForm = useForm<DemandForecastOverrideInput>({
    resolver: zodResolver(demandForecastOverrideSchema),
    defaultValues: { override_qty: 0, override_reason: "" },
  });

  const forecastForm = useForm<DemandForecastCreateInput>({
    resolver: zodResolver(demandForecastCreateSchema),
    defaultValues: {
      product_id: productId ?? "",
      period_start: "",
      period_end: "",
      forecast_qty: undefined,
    },
  });

  const onSubmitHistory = async (values: DemandHistoryCreateInput) => {
    await createHistory.mutateAsync({ ...values, product_id: productId });
    historyForm.reset({ product_id: productId, period_start: "", period_end: "", quantity: 0, source: "manual" });
  };

  const onSubmitOverride = async (values: DemandForecastOverrideInput) => {
    if (!overrideId) return;
    await overrideForecast.mutateAsync({ id: overrideId, data: values });
    setOverrideId(null);
    overrideForm.reset({ override_qty: 0, override_reason: "" });
  };

  const onSubmitForecast = async (values: DemandForecastCreateInput) => {
    await createForecast.mutateAsync({ ...values, product_id: productId });
    forecastForm.reset({ product_id: productId, period_start: "", period_end: "", forecast_qty: undefined });
  };

  const loading = historyLoading || forecastLoading;
  const loadError = historyError || forecastError;
  const errorMessage = getErrorMessage(historyErr ?? forecastErr, "Failed to load demand data.");

  const activeForecast = useMemo(
    () => forecasts?.find((f) => f.id === overrideId),
    [forecasts, overrideId]
  );

  const chartData = useMemo(() => {
    const histPoints = (history ?? []).map((h) => ({
      period: h.period_start,
      actual: h.quantity,
      forecast: null as number | null,
      override: null as number | null,
    }));
    const fcPoints = (forecasts ?? []).map((f) => ({
      period: f.period_start,
      actual: null as number | null,
      forecast: f.forecast_qty,
      override: f.override_qty,
    }));
    const merged = [...histPoints, ...fcPoints].sort((a, b) => a.period.localeCompare(b.period));
    return merged;
  }, [history, forecasts]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (loadError || !productId) {
    return <p className="text-sm text-destructive">{errorMessage || "Product not found."}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHero
        title={product?.name ?? "Product"}
        description="Manage historical demand and overrides for this product."
        pill={{ label: "Forecast detail" }}
        badges={[
          product?.sku ?? productId,
          `History: ${history?.length ?? 0}`,
          `Forecasts: ${forecasts?.length ?? 0}`,
        ]}
        actions={
          <>
            <RefreshButton
              label="Reset override"
              onClick={() => void setOverrideId(null)}
              tooltip="Clear selected override"
              buttonProps={{ className: "border-primary/30 bg-primary/5 text-primary" }}
            />
            <Button asChild size="sm" variant="secondary">
              <Link href="/planning/demand">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to list
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium">History vs Forecast</CardTitle>
            <CardDescription>Actuals, baseline, and overrides over time.</CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px]">
            <CalendarDays className="mr-1 h-3 w-3" />
            Chronological
          </Badge>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--chart-1)" dot={false} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="var(--chart-2)" strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="override" name="Override" stroke="var(--chart-3)" strokeDasharray="2 2" dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Add historical demand</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <Form {...historyForm}>
              <form onSubmit={historyForm.handleSubmit(onSubmitHistory)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={historyForm.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period start</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={historyForm.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period end</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={historyForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={historyForm.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="manual/import" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <Button type="submit" loading={createHistory.isPending} loadingText="Saving...">
                    Add history
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <p className="text-sm text-muted-foreground">Read-only view. Demand planners can add history.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Generate baseline forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <Form {...forecastForm}>
              <form onSubmit={forecastForm.handleSubmit(onSubmitForecast)} className="grid gap-4 md:grid-cols-3">
              <FormField
                control={forecastForm.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period start</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forecastForm.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period end</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={forecastForm.control}
                  name="forecast_qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast qty (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          onChange={(e) => {
                            const val = e.target.value === "" ? undefined : Number(e.target.value);
                            field.onChange(val);
                          }}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-3">
                  <Button type="submit" loading={createForecast.isPending} loadingText="Saving...">
                    Save forecast
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <p className="text-sm text-muted-foreground">Read-only view. Demand planners can generate forecasts.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Forecasts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Baseline</TableHead>
                <TableHead>Override</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts?.map((f) => (
                <TableRow key={f.id}>
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
                    {canEdit && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          setOverrideId(f.id);
                          overrideForm.reset({
                            override_qty: f.override_qty ?? f.forecast_qty,
                            override_reason: f.override_reason ?? "",
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
              </TableRow>
              ))}
              {!forecasts?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No forecasts yet. Add history to generate a baseline.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {overrideId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Override forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Editing period {activeForecast?.period_start} – {activeForecast?.period_end}
            </p>
            <Form {...overrideForm}>
              <form onSubmit={overrideForm.handleSubmit(onSubmitOverride)} className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={overrideForm.control}
                  name="override_qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Override quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={overrideForm.control}
                  name="override_reason"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., promo uplift" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 flex items-center gap-2">
                  <Button
                    type="submit"
                    loading={overrideForecast.isPending}
                    loadingText="Saving..."
                  >
                    Save override
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOverrideId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
