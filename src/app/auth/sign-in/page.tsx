import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Shield } from "lucide-react";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthPageShell>
      <div className="space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Use your email and password to continue
          </p>
        </div>
        <AuthForm
          mode="sign-in"
          error={params.error}
          message={params.message}
          hideCardHeader
        />
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Secure access to your single-tenant workspace.</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
