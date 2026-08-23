import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Quote, TriangleAlert, Upload, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { warrantyClause } from "@/lib/warranty-store";

export const Route = createFileRoute("/missing-evidence")({
  head: () => ({
    meta: [
      { title: "Missing evidence warning — Warranty Tracker" },
      {
        name: "description",
        content:
          "One required document is missing from your Samsung TV claim. Add the serial-number photo to avoid rejection.",
      },
      { property: "og:title", content: "Missing evidence warning — Warranty Tracker" },
      {
        property: "og:description",
        content: "Your claim is almost ready — one required proof item is still missing.",
      },
    ],
  }),
  component: MissingEvidence,
});

const checklist = [
  { label: "Purchase invoice", ok: true },
  { label: "Warranty card", ok: true },
  { label: "Fault photo/video", ok: true },
  { label: "Product serial-number photo", ok: false },
];

function MissingEvidence() {
  const navigate = useNavigate();

  return (
    <AppShell step={4} eyebrow="Step 4 of 6">
      <div className="rounded-2xl border-2 border-destructive/40 bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
            <TriangleAlert className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Your claim is almost ready — 1 item is missing.
            </h1>
            <p className="mt-2 text-sm font-semibold text-destructive">
              Samsung QLED 55-inch TV · 3 of 4 required documents available
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li
                key={c.label}
                className={
                  "flex items-center gap-3 rounded-xl border p-4 " +
                  (c.ok
                    ? "border-border bg-muted/50"
                    : "border-destructive/50 bg-destructive/[0.06]")
                }
              >
                <span
                  className={
                    "flex size-7 shrink-0 items-center justify-center rounded-full " +
                    (c.ok
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground")
                  }
                >
                  {c.ok ? <Check className="size-4" /> : <X className="size-4" />}
                </span>
                <span className="text-sm font-bold">{c.label}</span>
                <span
                  className={
                    "ml-auto text-sm font-bold " + (c.ok ? "text-success" : "text-destructive")
                  }
                >
                  {c.ok ? "Available" : "Missing"}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <blockquote className="rounded-xl border-l-4 border-destructive bg-warm p-5">
              <Quote className="size-4 text-destructive" />
              <p className="mt-2 text-sm leading-relaxed font-semibold">{warrantyClause}</p>
            </blockquote>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed font-semibold">
                Your Samsung TV&apos;s serial-number photo is missing. Add it now to avoid a delayed
                or rejected claim.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate({ to: "/upload-proof" })}>
            <Upload className="size-4" /> Upload missing proof
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/claim-checkup">
              <ArrowLeft className="size-4" /> Back
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
