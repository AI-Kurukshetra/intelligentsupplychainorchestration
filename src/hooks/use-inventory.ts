"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { InventoryAdjustInput } from "@/types/schemas";
import type { InventoryLevel } from "@/types/api.inventory";

export function useInventory(filters?: { product_id?: string; facility_id?: string; status?: string }) {
  const search = new URLSearchParams();
  if (filters?.product_id) search.set("product_id", filters.product_id);
  if (filters?.facility_id) search.set("facility_id", filters.facility_id);
  if (filters?.status) search.set("status", filters.status);

  const qs = search.toString();
  const url = qs ? `/inventory?${qs}` : "/inventory";

  return useQuery({
    queryKey: [QUERY_KEYS.inventory.all, filters],
    queryFn: () => apiGet<InventoryLevel[]>(url),
  });
}

export function useInventoryAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.alerts,
    queryFn: () => apiGet<InventoryLevel[]>("/inventory/alerts"),
  });
}

export function useAdjustInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; input: InventoryAdjustInput }) =>
      apiPatch<InventoryLevel>(`/inventory/${params.id}`, params.input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      if (variables.id) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.detail(variables.id) });
      }
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.alerts });
    },
  });
}

