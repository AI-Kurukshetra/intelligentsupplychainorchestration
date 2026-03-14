import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, ClipboardList, Users, Factory } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Control users, roles, and master data foundations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User management</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Invite users, assign roles, and reset passwords.</p>
            <Link
              href={`${ROUTES.ADMIN}/users`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full justify-center")}
            >
              <Users className="mr-2 h-4 w-4" /> Manage users
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master data</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Products, suppliers, facilities, BOMs — the backbone for planning.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={ROUTES.ADMIN_PRODUCTS}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-center")}
              >
                Products
              </Link>
              <Link
                href={ROUTES.ADMIN_SUPPLIERS}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-center")}
              >
                Suppliers
              </Link>
              <Link
                href={ROUTES.ADMIN_FACILITIES}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-center")}
              >
                Facilities
              </Link>
              <Link
                href={ROUTES.ADMIN_BOMS}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "justify-center")}
              >
                BOMs
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier portal</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Configure supplier access. Redirects supplier users to their portal.</p>
            <Link
              href={ROUTES.SUPPLIER_PORTAL}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full justify-center")}
            >
              View portal
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
