"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { SupplierCreateInput, SupplierUpdateInput } from "@/types/schemas";

export interface Supplier {
  id: string;
  name: string;
  contact_email: string;
  contact_name: string;
  country: string;
  status: "active" | "inactive";
  created_at: string;
}

export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.suppliers.all,
    queryFn: () => apiGet<Supplier[]>("/suppliers"),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierCreateInput) => apiPost<Supplier>("/suppliers", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all }),
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierUpdateInput) =>
      apiPatch<Supplier>(`/suppliers/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.detail(id) });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/suppliers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all }),
  });
}

