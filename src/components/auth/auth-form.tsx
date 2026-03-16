"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/types/schemas";
import { AlertCircle } from "lucide-react";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  error?: string;
  message?: string;
  /** When true, card has no title/description (page provides the heading). */
  hideCardHeader?: boolean;
};

export function AuthForm({
  mode,
  error: initialError,
  message,
  hideCardHeader = false,
}: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(initialError ?? null);

  useEffect(() => {
    if (message) {
      toast.info(message);
    }
  }, [message]);

  const isSignIn = mode === "sign-in";

  const form = useForm<SignInValues | SignUpValues>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    defaultValues: isSignIn
      ? { email: "", password: "" }
      : { email: "", password: "", displayName: "" },
  });

  const onSubmit = async (values: SignInValues | SignUpValues) => {
    setSubmitError(null);
    try {
      if (isSignIn) {
        const { email, password } = values as SignInValues;
        await signIn(email, password);
      } else {
        const { email, password, displayName } = values as SignUpValues;
        await signUp(email, password, displayName ?? null);
        toast.success("Check your email to confirm your account.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full overflow-hidden rounded-lg border-border/80 shadow-md shadow-black/5 transition-shadow dark:shadow-black/20">
      {!hideCardHeader && (
        <CardHeader className="space-y-1.5 pb-4 pt-6">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {isSignIn ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {isSignIn
              ? "Enter your email and password to continue."
              : "Enter your details below to get started."}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-5 pb-8", hideCardHeader ? "pt-6" : "pt-0")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {mode === "sign-up" && (
              <FormField
                control={form.control}
                name={"displayName" as keyof SignUpValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="displayName"
                        type="text"
                        placeholder="Jane Doe"
                        className="h-11 rounded-lg border-border/80 bg-background transition-colors focus-visible:ring-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name={"email" as keyof SignInValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-lg border-border/80 bg-background transition-colors focus-visible:ring-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"password" as keyof SignInValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-border/80 bg-background transition-colors focus-visible:ring-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription role="status">{submitError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-lg font-medium"
              loading={isSubmitting}
              loadingText={isSignIn ? "Signing in..." : "Signing up..."}
            >
              {isSignIn ? "Sign in" : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
