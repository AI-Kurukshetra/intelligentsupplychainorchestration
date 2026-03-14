"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type {
  DemandHistoryCreateInput,
  DemandForecastCreateInput,
  DemandForecastOverrideInput,
} from "@/types/schemas";
import type { DemandForecast, DemandHistory } from "@/types/api.demand";

export function useDemandForecasts(productId?: string) {
  const search = productId ? `?product_id=${productId}` : "";
  return useQuery({
    queryKey: productId ? [...QUERY_KEYS.demand.forecasts, productId] : QUERY_KEYS.demand.forecasts,
    queryFn: () => apiGet<DemandForecast[]>(`/demand/forecasts${search}`),
  });
}

export function useDemandHistory(productId?: string) {
  const search = productId ? `?product_id=${productId}` : "";
  return useQuery({
    queryKey: QUERY_KEYS.demand.history(productId),
    queryFn: () => apiGet<DemandHistory[]>(`/demand/history${search}`),
  });
}

export function useCreateDemandHistory(productId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DemandHistoryCreateInput) => apiPost<DemandHistory>("/demand/history", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.history(productId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.forecasts });
    },
  });
}

export function useCreateForecast(productId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DemandForecastCreateInput) =>
      apiPost<DemandForecast>("/demand/forecasts", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.forecasts });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.history(productId) });
    },
  });
}

export function useOverrideForecast(productId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: DemandForecastOverrideInput }) =>
      apiPost<DemandForecast>(`/demand/forecasts/${params.id}/override`, params.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.forecasts });
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.demand.forecasts, vars.id] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.demand.history(productId) });
    },
  });
}

