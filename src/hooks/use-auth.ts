"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";

export function useAuth() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const qc = useQueryClient();

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.profile.current });
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      router.push(ROUTES.DASHBOARD);
    },
    [router, supabase, qc]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string | null
    ): Promise<void> => {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";

      const emailRedirectTo = origin
        ? `${origin}/auth/callback?redirectTo=${encodeURIComponent(ROUTES.EMAIL_VERIFIED)}`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const identities = data.user?.identities ?? [];
      if (identities.length === 0) {
        // Supabase intentionally returns no error when the email already exists.
        // Surface a generic, privacy-safe message instead of silent success.
        throw new Error(
          "If this email is already registered, please sign in to your account."
        );
      }
    },
    [supabase]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    await qc.invalidateQueries({ queryKey: QUERY_KEYS.profile.current });
    await qc.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    router.push(ROUTES.HOME);
  }, [router, supabase, qc]);

  return { signIn, signUp, signOut };
}
