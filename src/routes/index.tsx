import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, ShieldCheck, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  formatINR,
  sortedProducts,
  totalProtectedValue,
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

function proofCount(p: Product, serialAdded: boolean) {
  const serial = p.id === "samsung-tv" && serialAdded ? "available" : p.proof.serialPhoto;
  return [p.proof.receipt, p.proof.warrantyCard, serial].filter((s) => s === "available").length;
}

function Dashboard() {
  const serialAdded = useSerialPhotoAdded();

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
              <span className="font-semibold">{serialAdded ? "3 of 4" : "2 of 4"} products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Sorted by nearest expiry</h2>
        <span className="text-xs font-medium text-muted-foreground">Soonest first</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {sortedProducts.map((p) => {
          const urgent = p.daysLeft <= 30;
          const ready = proofCount(p, serialAdded);
          const isSamsung = p.id === "samsung-tv";

          const card = (
            <div
              className={
                "surface-card h-full p-5 transition-all " +
                (isSamsung ? "hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5" : "")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {p.brand}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.category}</p>
                </div>
                {urgent ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                    <TriangleAlert className="size-3.5" /> Expiring soon
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                    <ShieldCheck className="size-3.5" /> Covered
                  </span>
                )}
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

              {isSamsung && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  View passport <ArrowRight className="size-4" />
                </p>
              )}
              {!isSamsung && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {ready < 3 ? "Missing proof — add it before you claim" : "All proof available"}
                </p>
              )}
            </div>
          );

          return isSamsung ? (
            <Link key={p.id} to="/passport" aria-label="View passport" className="block">
              {card}
            </Link>
          ) : (
            <div key={p.id}>{card}</div>
          );
        })}
      </div>
    </AppShell>
  );
}
