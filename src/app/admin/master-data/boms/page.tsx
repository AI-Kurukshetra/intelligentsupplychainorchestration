"use client";

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
import { useBoms, useCreateBom, useDeleteBom, useUpdateBom } from "@/hooks/use-boms";
import { useProducts } from "@/hooks/use-products";
import { bomCreateSchema, type BomCreateInput } from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { Pencil, Trash2, GitBranchPlus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/shared/page-hero";

export default function BomsPage() {
  const { data, isLoading, isError, error } = useBoms();
  const createMutation = useCreateBom();
  const deleteMutation = useDeleteBom();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(() => data?.find((b) => b.id === editingId) ?? null, [data, editingId]);
  const updateMutation = useUpdateBom(editingId ?? "");
  const { data: products } = useProducts();

  const form = useForm<BomCreateInput>({
    resolver: zodResolver(bomCreateSchema),
    defaultValues: {
      parent_product_id: "",
      component_product_id: "",
      quantity: 1,
      unit_of_measure: "ea",
    },
  });

  const onSubmit = async (values: BomCreateInput) => {
    if (editingId) {
      await updateMutation.mutateAsync(values);
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(values);
      form.reset({ parent_product_id: "", component_product_id: "", quantity: 1, unit_of_measure: "ea" });
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
        {getErrorMessage(error, "Failed to load BOMs.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="BOMs"
        description="Parent/component relationships."
        pill={{ label: "Master data" }}
        badges={["RLS enforced", "CRUD"]}
        actions={
          editingId ? (
            <Badge variant="outline" className="text-xs">
              Editing {editing?.id.slice(0, 6) ?? ""}
            </Badge>
          ) : null
        }
        variant="slate"
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranchPlus className="h-4 w-4 text-muted-foreground" />
              {editingId ? "Update BOM" : "Add BOM"}
            </CardTitle>
            <CardDescription>Link parent to component products.</CardDescription>
          </div>
          {editingId && (
            <Badge variant="outline" className="text-[11px]">
              Editing {editing?.id.slice(0, 6) ?? ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="parent_product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent product</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="component_product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component product</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select component product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0.01}
                        step="0.01"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex items-center gap-2">
                <Button
                  type="submit"
                  loading={editingId ? updateMutation.isPending : createMutation.isPending}
                  loadingText={editingId ? "Updating..." : "Saving..."}
                >
                  {editingId ? "Update BOM" : "Add BOM"}
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
          <CardTitle className="text-sm font-medium">BOMs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">{bom.parent_product_id}</TableCell>
                  <TableCell>{bom.component_product_id}</TableCell>
                  <TableCell>{bom.quantity}</TableCell>
                  <TableCell>{bom.unit_of_measure}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(bom.id);
                        form.reset({
                          parent_product_id: bom.parent_product_id,
                          component_product_id: bom.component_product_id,
                          quantity: bom.quantity,
                          unit_of_measure: bom.unit_of_measure,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(bom.id)}
                      loading={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No BOMs yet.
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
