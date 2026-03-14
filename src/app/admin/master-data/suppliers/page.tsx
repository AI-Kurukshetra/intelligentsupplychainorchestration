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
import { useSuppliers, useCreateSupplier, useDeleteSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
import { supplierCreateSchema, type SupplierCreateInput } from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { Pencil, Trash2, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/shared/page-hero";

export default function SuppliersPage() {
  const { data, isLoading, isError, error } = useSuppliers();
  const createMutation = useCreateSupplier();
  const deleteMutation = useDeleteSupplier();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingSupplier = useMemo(
    () => data?.find((s) => s.id === editingId) ?? null,
    [data, editingId]
  );
  const updateMutation = useUpdateSupplier(editingId ?? "");

  const form = useForm<SupplierCreateInput>({
    resolver: zodResolver(supplierCreateSchema),
    defaultValues: {
      name: "",
      contact_email: "",
      contact_name: "",
      country: "",
      status: "active",
    },
  });

  const onSubmit = async (values: SupplierCreateInput) => {
    if (editingId) {
      await updateMutation.mutateAsync(values);
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(values);
      form.reset({ name: "", contact_email: "", contact_name: "", country: "", status: "active" });
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
        {getErrorMessage(error, "Failed to load suppliers.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Suppliers"
        description="Maintain supplier contacts and status."
        pill={{ label: "Master data" }}
        badges={[
          "RLS enforced",
          `Total: ${data?.length ?? 0}`,
          editingId ? `Editing ${editingSupplier?.name ?? ""}` : "CRUD ready",
        ]}
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {editingId ? "Update supplier" : "Add supplier"}
            </CardTitle>
            <CardDescription>Contacts, country, and status.</CardDescription>
          </div>
          {editingId && (
            <Badge variant="outline" className="text-[11px]">
              Editing {editingSupplier?.name ?? ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Corp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Planner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="contact@example.com" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {editingId ? "Update supplier" : "Add supplier"}
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
          <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.country}</TableCell>
                  <TableCell>{supplier.contact_name}</TableCell>
                  <TableCell>{supplier.contact_email}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === "active" ? "secondary" : "outline"}>
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(supplier.id);
                        form.reset({
                          name: supplier.name,
                          country: supplier.country,
                          contact_name: supplier.contact_name,
                          contact_email: supplier.contact_email,
                          status: supplier.status,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(supplier.id)}
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
                    No suppliers yet.
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
