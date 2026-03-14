"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type Role } from "@/constants/roles";
import { useCreateUser } from "@/hooks/use-users";
import { createUserSchema, type CreateUserValues } from "@/types/schemas";
import { getErrorMessage } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function InviteUserForm() {
  const { mutateAsync, isPending } = useCreateUser();
  const [roleOpen, setRoleOpen] = useState(false);

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      display_name: "",
      role: ROLES.VIEWER,
      supplier_id: null,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const role = form.watch("role");

  const onSubmit = async (values: CreateUserValues) => {
    try {
      await mutateAsync(values);
      toast.success("User invited.");
      form.reset({
        email: "",
        display_name: "",
        role: ROLES.VIEWER,
        supplier_id: null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to invite user."));
    }
  };

  const roleLabel = (value: Role) =>
    value
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="user@company.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Jane Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={() => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <DropdownMenu open={roleOpen} onOpenChange={setRoleOpen}>
                  <DropdownMenuTrigger>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {roleLabel(role)}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {[
                      ROLES.ADMIN,
                      ROLES.SUPPLY_PLANNER,
                      ROLES.DEMAND_PLANNER,
                      ROLES.SUPPLIER,
                      ROLES.VIEWER,
                    ].map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => {
                          form.setValue("role", value, { shouldValidate: true });
                          if (value !== ROLES.SUPPLIER) {
                            form.setValue("supplier_id", null, { shouldValidate: true });
                          }
                        }}
                      >
                        {roleLabel(value)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === ROLES.SUPPLIER && (
            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="UUID"
                      onChange={(event) =>
                        field.onChange(event.target.value || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" loading={isPending} loadingText="Inviting...">
          Invite user
        </Button>
      </form>
    </Form>
  );
}
