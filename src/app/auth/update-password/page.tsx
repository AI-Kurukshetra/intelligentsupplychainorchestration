"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  updatePasswordSchema,
  type UpdatePasswordValues,
} from "@/types/schemas";
import { ROUTES } from "@/constants/routes";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setHasSession(Boolean(data.session));
      }
    });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: UpdatePasswordValues) => {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    router.replace(ROUTES.DASHBOARD);
  };

  if (hasSession === false) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Reset link expired</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Request a new password reset link from an administrator.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                loadingText="Updating..."
                className="w-full"
              >
                Update password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
