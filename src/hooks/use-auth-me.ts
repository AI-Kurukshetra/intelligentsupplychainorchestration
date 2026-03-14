"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";

export function useAuthMe() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => apiGet<{ id: string; email: string | null; display_name: string | null; role: string | null; supplier_id: string | null }>("/auth/me"),
  });
}

