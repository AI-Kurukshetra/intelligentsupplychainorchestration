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
import { useCreateException } from "@/hooks/use-exceptions";
import { useProducts } from "@/hooks/use-products";
import { useFacilities } from "@/hooks/use-facilities";
import { exceptionCreateSchema, type ExceptionCreateInput } from "@/types/schemas";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, AlertTriangle } from "lucide-react";

const severityOptions = ["critical", "high", "medium", "low"] as const;
const typeOptions = [
  "stockout_risk",
  "excess_inventory",
  "demand_spike",
  "supply_gap",
  "supplier_delay",
  "forecast_miss",
] as const;

export default function NewExceptionPage() {
  const router = useRouter();
  const createException = useCreateException();
  const { data: products } = useProducts();
  const { data: facilities } = useFacilities();
  const form = useForm<ExceptionCreateInput>({
    resolver: zodResolver(exceptionCreateSchema),
    defaultValues: {
      type: "stockout_risk",
      severity: "medium",
      title: "",
      description: "",
      related_product_id: null,
      related_facility_id: null,
    },
  });

  const onSubmit = async (values: ExceptionCreateInput) => {
    await createException.mutateAsync(values);
    router.push(ROUTES.EXCEPTIONS);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-rose-900 via-amber-900 to-slate-900 text-rose-50 shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.16),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(248,113,113,0.18),transparent_32%)]" />
        <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-rose-100">
              <Sparkles className="h-4 w-4" />
              New exception
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Create exception</h1>
            <p className="text-sm text-rose-100/85">
              Log an issue for planners to triage and resolve.
            </p>
          </div>
          <Badge variant="outline" className="border-white/30 bg-white/10 text-xs text-white inline-flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            P0 workflow
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Details</CardTitle>
          <CardDescription>Type, severity, and optional context links.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
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
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {severityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
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
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Inventory risk at DC West" />
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
                      <Input {...field} placeholder="Context, threshold crossed, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="related_product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related product (optional)</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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
                name="related_facility_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related facility (optional)</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(facilities ?? []).map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name} ({f.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" loading={createException.isPending} loadingText="Creating...">
                  Create
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
