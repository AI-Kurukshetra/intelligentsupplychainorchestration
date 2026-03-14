import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { PageHero } from "@/components/shared/page-hero";

const flows = [
  "Auth & Onboarding",
  "Demand Forecasting",
  "Inventory Visibility",
  "Exception Management",
  "Supply Planning",
  "Scenario Planning",
  "Supplier Collaboration",
  "S&OP Process",
  "KPI Dashboards",
];

const roles = [
  { title: "Admin", blurb: "Manages users, config, and integrations." },
  { title: "Supply Planner", blurb: "Plans production, procurement, and capacity." },
  { title: "Demand Planner", blurb: "Owns forecast accuracy and demand signals." },
  { title: "Supplier", blurb: "Updates capacity, lead times, and commitments." },
  { title: "Viewer", blurb: "Execs and stakeholders with read-only KPIs." },
];

const valueProps = [
  "One platform replacing fragmented spreadsheet workflows.",
  "Real-time visibility across demand, inventory, supply, and exceptions.",
  "Scenario modeling to evaluate trade-offs before committing plans.",
  "Structured collaboration between planners and suppliers.",
  "Built on a modern stack—fast to iterate and extend.",
];

const metrics = [
  { label: "Setup to first run", value: "< 1 day" },
  { label: "Accuracy lift", value: "Better in 90 days" },
  { label: "Exception resolution", value: "< 4 hours avg" },
  { label: "Planner adoption", value: "> 80% WAU in 60 days" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ContentContainer variant="wide" className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Supply Chain Control
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>

      <main className="flex-1 pb-16">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <ContentContainer variant="wide" className="py-12 md:py-16">
            <PageHero
              title="AI-assisted Supply Chain Orchestration"
              description="Single-tenant SaaS for mid-market manufacturers. Real-time visibility, coordinated planning, and fast response to disruption."
              pill={{ label: "Production ready" }}
              badges={["Demand", "Inventory", "Exceptions", "Planning"]}
              actions={
                <div className="flex gap-2">
                  <Link
                    href={user ? ROUTES.DASHBOARD : ROUTES.SIGN_IN}
                    className="group/button inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all outline-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {user ? "Open dashboard" : "Sign in to start"}
                  </Link>
                </div>
              }
            />
          </ContentContainer>
        </section>

        <ContentContainer variant="wide" className="py-12 space-y-12">
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <Badge variant="outline" className="w-fit">Problem</Badge>
                <CardTitle className="text-xl">Siloed, reactive planning</CardTitle>
                <CardDescription>
                  Planners juggle demand, supply, and inventory across spreadsheets and brittle ERP modules,
                  reacting to disruptions instead of steering the plan.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <Badge variant="outline" className="w-fit">Solution</Badge>
                <CardTitle className="text-xl">Control tower for planners</CardTitle>
                <CardDescription>
                  Unified data, exception alerts, scenario modeling, and supplier collaboration in one role-aware
                  dashboard—built on Next.js, Supabase, TanStack Query, and shadcn/ui.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Target users</h2>
              <Badge variant="outline">Single tenant deployment</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {roles.map((role) => (
                <Card key={role.title} className="h-full shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{role.blurb}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Value proposition</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {valueProps.map((item) => (
                <Card key={item} className="shadow-sm">
                  <CardContent className="py-4 text-sm">{item}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Core flows</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {flows.map((flow) => (
                <Card key={flow} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{flow}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {flow === "Exception Management"
                      ? "Detect supply/demand imbalances, assign, resolve, or escalate with comments."
                      : flow === "Demand Forecasting"
                        ? "Upload history, generate baselines, and apply manual overrides."
                        : flow === "Inventory Visibility"
                          ? "Live stock status with safety stock, reorder points, and alerts."
                          : flow === "Scenario Planning"
                            ? "Model what-if disruptions and compare outcomes before committing."
                            : flow === "Supplier Collaboration"
                              ? "Suppliers update lead times and capacity in a secure portal."
                              : flow === "KPI Dashboards"
                                ? "Track forecast accuracy, exception load, and inventory health."
                                : "Role-aware workflow inside the unified dashboard."}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Success metrics</h2>
              <Badge variant="outline">Execution goals</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <Card key={m.label} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </ContentContainer>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <ContentContainer variant="wide" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Ready to orchestrate your supply chain?</p>
            <p className="text-sm text-muted-foreground">Log in to your tenant or talk to us about rollout.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={user ? ROUTES.DASHBOARD : ROUTES.SIGN_IN}
              className="group/button inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all outline-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {user ? "Open dashboard" : "Sign in"}
            </Link>
            <Link
              href="mailto:sales@supplychaincontrol.com"
              className="group/button inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
            >
              Book a demo
            </Link>
          </div>
        </ContentContainer>
      </footer>
    </div>
  );
}
