import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Download, FileCheck2, Mail } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { claimEmail, useSerialPhotoAdded, warrantyClause } from "@/lib/warranty-store";

export const Route = createFileRoute("/case-file")({
  head: () => ({
    meta: [
      { title: "Your claim case file is ready — Warranty Tracker" },
      {
        name: "description",
        content:
          "A complete Samsung TV warranty claim file: product details, fault report, proof documents and a pre-filled support email.",
      },
      { property: "og:title", content: "Your claim case file is ready — Warranty Tracker" },
      {
        property: "og:description",
        content: "Everything Samsung Support needs, packaged into one claim case file.",
      },
    ],
  }),
  component: CaseFile,
});

function CaseFile() {
  const serialAdded = useSerialPhotoAdded();

  const proofs = [
    { label: "Purchase invoice", file: "samsung-tv-invoice.pdf", ok: true },
    { label: "Warranty card", file: "samsung-warranty-card.jpg", ok: true },
    { label: "Fault photo/video", file: "tv-flicker-clip.mp4", ok: true },
    {
      label: "Product serial-number photo",
      file: "samsung-tv-serial-label.jpg",
      ok: serialAdded,
    },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(claimEmail);
      toast.success("Claim email copied to your clipboard.");
    } catch {
      toast.success("Claim email ready to copy.");
    }
  };

  return (
    <AppShell step={6} eyebrow="Step 6 of 6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground">
          <FileCheck2 className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Your claim case file is ready</h1>
          <p className="mt-2 text-base text-muted-foreground">
            All 4 required documents are attached. Send it to Samsung Support in one go.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-base font-bold">Product</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Product", "Samsung QLED 55-inch TV"],
                ["Purchase date", "9 September 2025"],
                ["Price paid", "₹72,990"],
                ["Issue reported", "Display flickering / image issue"],
                ["Issue started", "3 days ago"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-bold">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="text-muted-foreground">Warranty status</dt>
                <dd className="font-bold text-success">
                  In warranty · until 8 September 2027 (18 days left)
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-base font-bold">Proof documents</h2>
            <ul className="mt-4 space-y-3">
              {proofs.map((p) => (
                <li
                  key={p.label}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3.5 " +
                    (p.ok ? "border-border bg-muted/50" : "border-destructive/50 bg-destructive/5")
                  }
                >
                  <span
                    className={
                      "flex size-7 shrink-0 items-center justify-center rounded-full " +
                      (p.ok
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground")
                    }
                  >
                    <Check className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{p.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.file}</p>
                  </div>
                  <span
                    className={
                      "ml-auto shrink-0 text-sm font-bold " +
                      (p.ok ? "text-success" : "text-destructive")
                    }
                  >
                    {p.ok ? "Available" : "Missing"}
                  </span>
                </li>
              ))}
            </ul>
            <blockquote className="mt-5 rounded-xl border-l-4 border-primary bg-warm p-4 text-sm leading-relaxed font-semibold">
              {warrantyClause}
            </blockquote>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border bg-warm px-6 py-4">
              <p className="text-sm font-bold">Case file preview</p>
              <p className="text-xs text-muted-foreground">
                warranty-claim-samsung-qled-55.pdf · 4 pages
              </p>
            </div>
            <div className="space-y-3 p-6 text-sm">
              {[
                "Page 1 — Claim summary & product passport",
                "Page 2 — Purchase invoice",
                "Page 3 — Warranty card & clause 4.2",
                "Page 4 — Fault media & serial-number photo",
              ].map((p) => (
                <div key={p} className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="flex items-center gap-2 text-base font-bold">
              <Mail className="size-4 text-primary" /> Pre-filled email to Samsung Support
            </p>
            <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {claimEmail}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => toast.success("Case file PDF downloaded (demo).")}>
          <Download className="size-4" /> Download case file PDF
        </Button>
        <Button size="lg" variant="secondary" onClick={copyEmail}>
          <Copy className="size-4" /> Copy claim email
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">
            <ArrowLeft className="size-4" /> Back to vault
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
