"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { FacilityCreateInput, FacilityUpdateInput } from "@/types/schemas";

export interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity_units: number;
  created_at: string;
}

export function useFacilities() {
  return useQuery({
    queryKey: QUERY_KEYS.facilities.all,
    queryFn: () => apiGet<Facility[]>("/facilities"),
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FacilityCreateInput) => apiPost<Facility>("/facilities", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.facilities.all }),
  });
}

export function useUpdateFacility(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FacilityUpdateInput) =>
      apiPatch<Facility>(`/facilities/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.facilities.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.facilities.detail(id) });
    },
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/facilities/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.facilities.all }),
  });
}

