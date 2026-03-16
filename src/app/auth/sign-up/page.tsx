import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Users } from "lucide-react";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const allowPublicSignup =
    process.env.NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP?.trim() !== "false";
  if (!allowPublicSignup) {
    redirect(
      "/auth/sign-in?message=Contact%20an%20administrator%20for%20access."
    );
  }
  const params = await searchParams;
  return (
    <AuthPageShell>
      <div className="space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to get started
          </p>
        </div>
        <AuthForm
          mode="sign-up"
          error={params.error}
          message={params.message}
          hideCardHeader
        />
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>Admins can invite planners, suppliers, and viewers once you&apos;re in.</span>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
