import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Plus, Search, ShieldCheck, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatINR,
  proofCount,
  sortedProducts,
  totalProtectedValue,
  useReminders,
  useSerialPhotoAdded,
  type Product,
} from "@/lib/warranty-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Warranty Vault — Warranty Tracker" },
      {
        name: "description",
        content:
          "Track every product warranty, spot expiring coverage early, and keep claim proof ready in one vault.",
      },
      { property: "og:title", content: "Your Warranty Vault — Warranty Tracker" },
      {
        property: "og:description",
        content: "Track warranties, expiry dates and claim proof for everything you own.",
      },
    ],
  }),
  component: Dashboard,
});

type Filter = "all" | "expiring" | "missing" | "ready" | "reminders";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "expiring", label: "Expiring soon" },
  { id: "missing", label: "Missing proof" },
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

  const claimReadyCount = sortedProducts.filter((p) => proofCount(p, serialAdded) === 3).length;

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
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
            4 products protected
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Your Warranty Vault</h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Every receipt, warranty card and serial-number photo in one place — so a claim never
            fails on missing paperwork.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/add-product">
              <Plus className="size-4" /> Add product
            </Link>
          </Button>
        </div>

        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-muted-foreground">Total protected value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            {formatINR(totalProtectedValue)}
          </p>
          <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expiring in 30 days</span>
              <span className="font-semibold text-destructive">2 products</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Claim-ready</span>
              <span className="font-semibold">{claimReadyCount} of 4 products</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expiry reminders</span>
              <span className="font-semibold">{reminders.size} set</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold">Coverage timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">How much manufacturer warranty is left.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sortedProducts.map((p) => {
            const urgent = p.daysLeft <= 30;
            const pct = Math.max(6, Math.min(100, Math.round((p.daysLeft / 365) * 100)));
            return (
              <Link
                key={p.id}
                to="/passport"
                search={{ product: p.id }}
                className="surface-card block p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className={"mt-1 text-xs font-semibold " + (urgent ? "text-destructive" : "text-muted-foreground")}>
                  {p.daysLeft} days left
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={"h-full rounded-full " + (urgent ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
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
          const ready = proofCount(p, serialAdded);
          const reminded = reminders.has(p.id);

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
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {p.brand}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {urgent ? (
                      <span className="flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                        <TriangleAlert className="size-3.5" /> Expiring soon
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                        <ShieldCheck className="size-3.5" /> Covered
                      </span>
                    )}
                    {reminded && (
                      <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-1 text-xs font-bold">
                        <Bell className="size-3.5 text-primary" /> Reminder on
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="font-bold">{formatINR(p.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Warranty ends</p>
                    <p className={"font-bold " + (urgent ? "text-destructive" : "")}>
                      in {p.daysLeft} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Proof</p>
                    <p className={"font-bold " + (ready < 3 ? "text-destructive" : "")}>{ready}/3</p>
                  </div>
                </div>

                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  View passport <ArrowRight className="size-4" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
