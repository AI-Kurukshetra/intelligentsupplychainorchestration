"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { UserListItem } from "@/types/api";
import type { CreateUserValues } from "@/types/schemas";

export type UseUsersParams = {
  page?: number;
  limit?: number;
};

/**
 * Returns list of users. apiGet unwraps the success payload, so the API's
 * { success, data: UserListItem[], metadata } becomes just UserListItem[] here.
 */
export function useUsers(params: UseUsersParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: [QUERY_KEYS.users.all, { page, limit }],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      return apiGet<UserListItem[]>(`/admin/users?${search.toString()}`);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      role: UserListItem["role"];
      supplier_id?: string | null;
    }) => {
      return apiPatch<UserListItem>(`/admin/users/${input.id}`, {
        role: input.role,
        supplier_id: input.supplier_id ?? null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserValues) => {
      return apiPost<UserListItem>("/admin/users/invite", input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (input: { id: string }) => {
      return apiPost<{ message: string }>(`/admin/users/${input.id}/reset-password`);
    },
  });
}
