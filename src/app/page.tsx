import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  Eye,
  GitBranch,
  Handshake,
  LayoutDashboard,
  LineChart,
  LogIn,
  Package,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";

const roles = [
  { title: "Admin", blurb: "Users, config, integrations.", icon: UserCog },
  { title: "Supply Planner", blurb: "Production, procurement, capacity.", icon: Package },
  { title: "Demand Planner", blurb: "Forecast accuracy, demand signals.", icon: TrendingUp },
  { title: "Supplier", blurb: "Capacity, lead times, commitments.", icon: Building2 },
  { title: "Viewer", blurb: "Read-only dashboards and KPIs.", icon: Eye },
];

const flows: { title: string; blurb: string; icon: typeof LogIn }[] = [
  { title: "Auth & Onboarding", blurb: "Login, roles, profile.", icon: LogIn },
  { title: "Demand Forecasting", blurb: "Upload history, baselines, overrides.", icon: LineChart },
  { title: "Inventory Visibility", blurb: "Stock levels, safety stock, alerts.", icon: Package },
  {
    title: "Exception Management",
    blurb: "Imbalances, assign, resolve, escalate.",
    icon: AlertTriangle,
  },
  { title: "Supply Planning", blurb: "Plans tied to demand signals.", icon: CalendarDays },
  { title: "Scenario Planning", blurb: "What-if disruptions, compare outcomes.", icon: GitBranch },
  { title: "Supplier Collaboration", blurb: "Lead times, capacity, portal.", icon: Handshake },
  { title: "S&OP Process", blurb: "Align demand and supply, rolling cycle.", icon: RefreshCw },
  { title: "KPI Dashboards", blurb: "Forecast accuracy, exceptions, inventory.", icon: BarChart3 },
];

const metrics = [
  { label: "Setup to first run", value: "< 1 day", icon: Timer },
  { label: "Accuracy lift", value: "90 days", icon: Target },
  { label: "Exception resolution", value: "< 4 h avg", icon: Clock },
  { label: "Planner adoption", value: "> 80% WAU", icon: Users },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <ContentContainer variant="wide" className="flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            Supply Chain Control
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>

      <main className="relative z-10 flex-1 pb-20">
        <section className="relative overflow-hidden border-b border-border/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--primary)/12%,transparent)]" />
          <ContentContainer variant="wide" className="relative py-16 md:py-24">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <h1
                className="animate-fade-in-up font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                AI-assisted Supply Chain <span className="text-primary">Orchestration</span>
              </h1>
              <p
                className="animate-fade-in-up text-lg text-muted-foreground md:text-xl"
                style={{ animationDelay: "160ms" }}
              >
                One platform for demand, supply, inventory, and exceptions. Built for mid-market
                manufacturers.
              </p>
              <div
                className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3 pt-2"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href={user ? ROUTES.DASHBOARD : ROUTES.SIGN_IN}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {user ? "Open dashboard" : "Sign in to start"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="mailto:sales@supplychaincontrol.com"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Book a demo
                </Link>
              </div>
              <div
                className="animate-fade-in-up flex flex-wrap justify-center gap-2 pt-4"
                style={{ animationDelay: "320ms" }}
              >
                {["Demand", "Inventory", "Exceptions", "Planning"].map((b) => (
                  <Badge
                    key={b}
                    variant="outline"
                    className="border-border/80 bg-background/80 text-xs font-medium"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          </ContentContainer>
        </section>

        <ContentContainer variant="wide" className="space-y-16 py-16">
          {/* Problem / Solution */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card
              className="animate-fade-in-up border-border/80 shadow-sm transition-shadow hover:shadow-md"
              style={{ animationDelay: "0ms" }}
            >
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Problem
                </Badge>
                <CardTitle className="text-xl">Siloed, reactive planning</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Planners juggle spreadsheets and brittle ERP modules, reacting to disruptions
                  instead of steering the plan.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card
              className="animate-fade-in-up border-border/80 shadow-sm transition-shadow hover:shadow-md"
              style={{ animationDelay: "80ms" }}
            >
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit gap-1">
                  <LayoutDashboard className="h-3 w-3" />
                  Solution
                </Badge>
                <CardTitle className="text-xl">Control tower for planners</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Unified data, exception alerts, scenario modeling, and supplier collaboration in
                  one role-aware dashboard.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          {/* Target users */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Who it’s for</h2>
              <Badge variant="outline">Single tenant</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {roles.map(({ title, blurb, icon: Icon }) => (
                <Card
                  key={title}
                  className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" />
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{blurb}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Core flows */}
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Core flows</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flows.map(({ title, blurb, icon: Icon }) => (
                <Card
                  key={title}
                  className="border-border/80 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" />
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{blurb}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Success metrics */}
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Outcomes</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(({ label, value, icon: Icon }) => (
                <Card
                  key={label}
                  className="border-border/80 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </ContentContainer>
      </main>

      <footer className="relative z-10 border-t border-border/80 bg-muted/30 py-10">
        <ContentContainer
          variant="wide"
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">Ready to orchestrate your supply chain?</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={user ? ROUTES.DASHBOARD : ROUTES.SIGN_IN}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {user ? "Open dashboard" : "Sign in"}
            </Link>
            <Link
              href="mailto:sales@supplychaincontrol.com"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Book a demo
            </Link>
          </div>
        </ContentContainer>
      </footer>
    </div>
  );
}
