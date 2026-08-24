import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bell, Plus, Search, ShieldCheck, TriangleAlert, Scan, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatINR,
  proofCount,
  claimReadinessScore,
  resolvedProof,
  useProducts,
  useReminders,
  useSerialPhotoAdded,
  type Product,
} from "@/lib/warranty-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClaimReady — Turn your warranty into a claim-ready case" },
      {
        name: "description",
        content: "Keep receipts, warranty documents, serial numbers, and proof together — so you can build a claim in seconds.",
      },
    ],
  }),
  component: Dashboard,
});

type Filter = "all" | "expiring" | "missing" | "ready" | "reminders";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "expiring", label: "Expiring soon" },
  { id: "missing", label: "Needs attention" },
  { id: "ready", label: "Claim-ready" },
  { id: "reminders", label: "Reminders" },
];

function matchesFilter(p: Product, filter: Filter, serialAdded: boolean, reminded: boolean) {
  const ready = proofCount(p, serialAdded) === 3;
  if (filter === "expiring") return p.daysLeft <= 30;
  if (filter === "missing") return !ready;
  if (filter === "ready") return ready;
  if (filter === "reminders") return reminded;
  return true;
}

function Dashboard() {
  const serialAdded = useSerialPhotoAdded();
  const reminders = useReminders();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const navigate = useNavigate();

  const products = useProducts();
  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.daysLeft - b.daysLeft), [products]);
  const totalProtectedValue = useMemo(() => products.reduce((sum, p) => sum + p.value, 0), [products]);

  const claimReadyCount = sortedProducts.filter((p) => proofCount(p, serialAdded) === 3).length;
  const needsAttentionCount = sortedProducts.length - claimReadyCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedProducts.filter((p) => {
      const text = `${p.brand} ${p.name} ${p.category}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      return matchesQuery && matchesFilter(p, filter, serialAdded, reminders.has(p.id));
    });
  }, [query, filter, serialAdded, reminders]);

  return (
    <AppShell step={0}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight">ClaimReady</h1>
          <p className="mt-3 text-xl font-bold text-primary">
            Turn your warranty into a claim-ready case.
          </p>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Keep receipts, warranty documents, serial numbers, and proof together — so you can build a claim in seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all">
              <Link to="/scan">
                Make My Products Claim-Ready <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/add-product">
                <Plus className="mr-2 size-4" /> Add product
              </Link>
            </Button>
          </div>
        </div>

        <div className="surface-card p-6 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <p className="text-3xl font-extrabold">{sortedProducts.length}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">Products Protected</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{formatINR(totalProtectedValue)}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">Protected Value</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-destructive">{needsAttentionCount}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">Claims Need Attention</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-success">{claimReadyCount}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">Fully Claim-Ready</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Sorted by nearest expiry</h2>
          <span className="text-xs font-medium text-muted-foreground">Soonest first</span>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or product"
            className="h-10 bg-card pl-9"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
              (filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {visible.length === 0 && (
          <div className="surface-card col-span-full p-8 text-center text-sm text-muted-foreground">
            No products match that search. Try another filter or clear the search box.
          </div>
        )}
        {visible.map((p) => {
          const urgent = p.daysLeft <= 30;
          const readyCount = proofCount(p, serialAdded);
          const score = claimReadinessScore(p, serialAdded);
          const reminded = reminders.has(p.id);
          const resolved = resolvedProof(p, serialAdded);

          return (
            <Link
              key={p.id}
              to="/passport"
              search={{ product: p.id }}
              aria-label={`View passport for ${p.name}`}
              className="block"
            >
              <div className="surface-card h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Purchased: {p.purchaseDate}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {urgent ? (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                        <TriangleAlert className="size-3.5" /> {p.daysLeft} days left
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                        <ShieldCheck className="size-3.5" /> {p.daysLeft} days left
                      </span>
                    )}
                    {reminded && (
                      <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-1 text-xs font-bold text-primary">
                        <Bell className="size-3.5" /> Reminder on
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-muted-foreground">Warranty expires in <span className="text-foreground">{p.daysLeft} days</span> ({p.warrantyEnd})</span>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">Claim readiness: {score}%</span>
                    <span className="text-xs font-semibold text-muted-foreground">{readyCount} of 3 evidence collected</span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full ${score === 100 ? 'bg-success' : score > 50 ? 'bg-amber-500' : 'bg-destructive'}`} style={{ width: `${score}%` }} />
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {resolved.receipt === 'available' ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                      <span className={resolved.receipt === 'available' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Receipt</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {resolved.warrantyCard === 'available' ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                      <span className={resolved.warrantyCard === 'available' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Warranty card</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {resolved.serialPhoto === 'available' ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                      <span className={resolved.serialPhoto === 'available' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Serial number photo</span>
                    </li>
                  </ul>
                </div>

                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Complete Claim Readiness <ArrowRight className="size-4" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
