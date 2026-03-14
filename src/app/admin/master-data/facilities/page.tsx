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
import { useFacilities, useCreateFacility, useDeleteFacility, useUpdateFacility } from "@/hooks/use-facilities";
import { facilityCreateSchema, type FacilityCreateInput } from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { Pencil, Trash2, Factory } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/shared/page-hero";

export default function FacilitiesPage() {
  const { data, isLoading, isError, error } = useFacilities();
  const createMutation = useCreateFacility();
  const deleteMutation = useDeleteFacility();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(() => data?.find((f) => f.id === editingId) ?? null, [data, editingId]);
  const updateMutation = useUpdateFacility(editingId ?? "");

  const form = useForm<FacilityCreateInput>({
    resolver: zodResolver(facilityCreateSchema),
    defaultValues: {
      name: "",
      type: "",
      location: "",
      capacity_units: 0,
    },
  });

  const onSubmit = async (values: FacilityCreateInput) => {
    if (editingId) {
      await updateMutation.mutateAsync(values);
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(values);
      form.reset({ name: "", type: "", location: "", capacity_units: 0 });
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
        {getErrorMessage(error, "Failed to load facilities.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="Facilities"
        description="Track sites and capacity."
        pill={{ label: "Master data" }}
        badges={["RLS enforced", "CRUD"]}
        actions={
          editingId ? (
            <Badge variant="outline" className="text-xs">
              Editing {editing?.name ?? ""}
            </Badge>
          ) : null
        }
        variant="slate"
      />

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              {editingId ? "Update facility" : "Add facility"}
            </CardTitle>
            <CardDescription>Type, location, and capacity.</CardDescription>
          </div>
          {editingId && (
            <Badge variant="outline" className="text-[11px]">
              Editing {editing?.name ?? ""}
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
                      <Input {...field} placeholder="DC West" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Warehouse" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dallas, TX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (units)</FormLabel>
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
              <div className="md:col-span-2 flex items-center gap-2">
                <Button
                  type="submit"
                  loading={editingId ? updateMutation.isPending : createMutation.isPending}
                  loadingText={editingId ? "Updating..." : "Saving..."}
                >
                  {editingId ? "Update facility" : "Add facility"}
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
          <CardTitle className="text-sm font-medium">Facilities</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>{facility.type}</TableCell>
                  <TableCell>{facility.location}</TableCell>
                  <TableCell>{facility.capacity_units}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(facility.id);
                        form.reset({
                          name: facility.name,
                          type: facility.type,
                          location: facility.location,
                          capacity_units: facility.capacity_units,
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(facility.id)}
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
                    No facilities yet.
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
