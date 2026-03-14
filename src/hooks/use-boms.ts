"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { BomCreateInput, BomUpdateInput } from "@/types/schemas";

export interface Bom {
  id: string;
  parent_product_id: string;
  component_product_id: string;
  quantity: number;
  unit_of_measure: string;
}

export function useBoms() {
  return useQuery({
    queryKey: QUERY_KEYS.boms.all,
    queryFn: () => apiGet<Bom[]>("/boms"),
  });
}

export function useCreateBom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BomCreateInput) => apiPost<Bom>("/boms", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.boms.all }),
  });
}

export function useUpdateBom(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BomUpdateInput) => apiPatch<Bom>(`/boms/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.boms.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.boms.detail(id) });
    },
  });
}

export function useDeleteBom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/boms/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.boms.all }),
  });
}

