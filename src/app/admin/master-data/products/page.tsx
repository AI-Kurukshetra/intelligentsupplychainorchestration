"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { productCreateSchema, type ProductCreateInput } from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { Pencil, Trash2, PackageSearch } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";

export default function ProductsPage() {
  const { data, isLoading, isError, error } = useProducts();
  const createMutation = useCreateProduct();
  const deleteMutation = useDeleteProduct();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingProduct = useMemo(
    () => data?.find((p) => p.id === editingId) ?? null,
    [data, editingId]
  );
  const updateMutation = useUpdateProduct(editingId ?? "");

  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      unit_of_measure: "ea",
      lead_time_days: 0,
    },
  });

  const onSubmit = async (values: ProductCreateInput) => {
    if (editingId) {
      await updateMutation.mutateAsync(values);
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(values);
      form.reset({ sku: "", name: "", description: "", unit_of_measure: "ea", lead_time_days: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load products.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Products"
        description="Manage SKUs, lead times, and units."
        pill={{ label: "Master data" }}
        badges={[
          "RLS enforced",
          `Total: ${data?.length ?? 0}`,
          editingId ? `Editing ${editingProduct?.sku ?? ""}` : "Create & update",
        ]}
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-muted-foreground" />
              {editingId ? "Update product" : "Add product"}
            </CardTitle>
            <CardDescription>SKU, UOM, and lead time.</CardDescription>
          </div>
          {editingId && (
            <Badge variant="outline" className="text-[11px]">
              Editing {editingProduct?.sku ?? ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SKU123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Widget" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_of_measure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of measure</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ea" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead time (days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex items-center gap-2">
                <Button
                  type="submit"
                  loading={
                    editingId ? updateMutation.isPending : createMutation.isPending
                  }
                  loadingText={editingId ? "Updating..." : "Saving..."}
                >
                  {editingId ? "Update product" : "Add product"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Products</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Lead time (days)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.unit_of_measure}</TableCell>
                  <TableCell>{product.lead_time_days}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {product.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(product.id);
                        form.reset({
                          sku: product.sku,
                          name: product.name,
                          description: product.description ?? "",
                          unit_of_measure: product.unit_of_measure,
                          lead_time_days: product.lead_time_days,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(product.id)}
                      loading={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No products yet.
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
