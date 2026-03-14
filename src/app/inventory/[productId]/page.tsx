"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useInventory } from "@/hooks/use-inventory";
import { useProducts } from "@/hooks/use-products";
import { useFacilities } from "@/hooks/use-facilities";
import { getErrorMessage, cn } from "@/lib/utils";
import { ArrowLeft, Factory, Sparkles } from "lucide-react";
import Link from "next/link";

function statusBadge(status: string | undefined) {
  switch (status) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "low":
      return <Badge variant="secondary">Low</Badge>;
    case "excess":
      return <Badge variant="outline">Excess</Badge>;
    default:
      return <Badge variant="secondary">OK</Badge>;
  }
}

export default function InventoryProductPage() {
  const params = useParams<{ productId: string }>();
  const productId = params?.productId;
  const { data, isLoading, isError, error } = useInventory({ product_id: productId });
  const { data: products } = useProducts();
  const { data: facilities } = useFacilities();

  const product = products?.find((p) => p.id === productId);
  const facilityMap = new Map(facilities?.map((f) => [f.id, f]) ?? []);

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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-50 shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
              <Sparkles className="h-4 w-4" />
              Inventory detail
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{product?.name ?? "Product inventory"}</h1>
            <p className="text-sm text-slate-200/80">
              Facility-level visibility for this SKU.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">Facilities</Badge>
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">Safety</Badge>
              <Badge variant="outline" className="border-white/20 bg-white/5 text-white">Reorder</Badge>
            </div>
          </div>
          <Link
            href="/inventory"
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              "bg-white text-slate-900 hover:bg-slate-100"
            )}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to inventory
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Factory className="h-4 w-4 text-muted-foreground" />
            Inventory by facility
          </CardTitle>
          <CardDescription>On hand vs safety/reorder thresholds per site.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>Reorder</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((row) => {
                const facility = facilityMap.get(row.facility_id);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {facility?.name ?? row.facility_id}
                      <div className="text-xs text-muted-foreground">{facility?.location}</div>
                    </TableCell>
                    <TableCell>{row.quantity_on_hand}</TableCell>
                    <TableCell>{row.safety_stock_qty}</TableCell>
                    <TableCell>{row.reorder_point}</TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                  </TableRow>
                );
              })}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No inventory records for this product.
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
