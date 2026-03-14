import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Boxes, Factory, ClipboardList } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";

const links = [
  { label: "Products", href: ROUTES.ADMIN_PRODUCTS, icon: Boxes, description: "SKUs, lead times, units" },
  { label: "Suppliers", href: ROUTES.ADMIN_SUPPLIERS, icon: Factory, description: "Contacts, country, status" },
  { label: "Facilities", href: ROUTES.ADMIN_FACILITIES, icon: Factory, description: "Sites and capacity" },
  { label: "BOMs", href: ROUTES.ADMIN_BOMS, icon: ClipboardList, description: "Parent/component relationships" },
];

export default function MasterDataHomePage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="Master Data"
        description="Core reference data used by planning, inventory, and exceptions."
        pill={{ label: "Admin" }}
        badges={["Products", "Suppliers", "Facilities", "BOMs"]}
        variant="slate"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.href} className="rounded-lg">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{link.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href={link.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
