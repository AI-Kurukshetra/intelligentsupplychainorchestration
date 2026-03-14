"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type {
  ExceptionCreateInput,
  ExceptionUpdateInput,
  ExceptionCommentInput,
} from "@/types/schemas";
import type { Exception, ExceptionComment } from "@/types/api.exceptions";

export function useExceptions(filters?: { status?: string; severity?: string; type?: string }) {
  const search = new URLSearchParams();
  if (filters?.status) search.set("status", filters.status);
  if (filters?.severity) search.set("severity", filters.severity);
  if (filters?.type) search.set("type", filters.type);
  const qs = search.toString();
  const url = qs ? `/exceptions?${qs}` : "/exceptions";

  return useQuery({
    queryKey: [QUERY_KEYS.exceptions.all, filters],
    queryFn: () => apiGet<Exception[]>(url),
  });
}

export function useExceptionDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.exceptions.detail(id),
    queryFn: () => apiGet<Exception>(`/exceptions/${id}`),
    enabled: Boolean(id),
  });
}

export function useExceptionComments(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.exceptions.comments(id),
    queryFn: () => apiGet<ExceptionComment[]>(`/exceptions/${id}/comments`),
    enabled: Boolean(id),
  });
}

export function useCreateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExceptionCreateInput) => apiPost<Exception>("/exceptions", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.exceptions.all }),
  });
}

export function useUpdateException(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExceptionUpdateInput) => apiPatch<Exception>(`/exceptions/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.exceptions.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.exceptions.detail(id) });
    },
  });
}

export function useCreateExceptionComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExceptionCommentInput) =>
      apiPost<ExceptionComment>(`/exceptions/${id}/comments`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.exceptions.comments(id) });
    },
  });
}

