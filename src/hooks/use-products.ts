"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { ProductCreateInput, ProductUpdateInput } from "@/types/schemas";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_of_measure: string;
  lead_time_days: number;
  created_at: string;
}

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.all,
    queryFn: () => apiGet<Product[]>("/products"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductCreateInput) => apiPost<Product>("/products", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.products.all }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductUpdateInput) => apiPatch<Product>(`/products/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.products.all }),
  });
}

