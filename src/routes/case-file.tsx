import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Copy, Download, FileCheck2, Mail, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { 
  useProduct, 
  claimEmail, 
  resolvedProof, 
  formatINR,
  useSerialPhotoAdded, 
  warrantyClause 
} from "@/lib/warranty-data";

export const Route = createFileRoute("/case-file")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = search["product"];
    return typeof product === "string" ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Warranty Claim Case File — ClaimReady" },
      {
        name: "description",
        content: "A complete warranty claim file: product details, fault report, proof documents and a pre-filled support email.",
      },
    ],
  }),
  component: CaseFile,
});

function CaseFile() {
  const { product: productId } = Route.useSearch();
  const product = useProduct(productId);
  const serialAdded = useSerialPhotoAdded();
  const resolved = resolvedProof(product, serialAdded);

  const proofs = [
    { label: "Purchase invoice", file: `${product.brand.toLowerCase()}-invoice.pdf`, ok: resolved.receipt === 'available' },
    { label: "Warranty document", file: `${product.brand.toLowerCase()}-warranty.pdf`, ok: resolved.warrantyCard === 'available' },
    { label: "Fault photo/video", file: "fault-evidence.mp4", ok: true },
    {
      label: "Product serial-number photo",
      file: `${product.brand.toLowerCase()}-serial-label.jpg`,
      ok: resolved.serialPhoto === 'available',
    },
  ];

  const dynamicClaimEmail = `To: support@${product.brand.toLowerCase()}.com
Subject: Warranty Claim - ${product.name} (Serial: ${product.serialNumber})

Hello ${product.brand} Support,

I am writing to file a warranty claim for my ${product.name}, purchased on ${product.purchaseDate}.

Issue reported:
The device is experiencing issues (Display flickering / image issue) which started 3 days ago.

Attached you will find all required documentation for this claim:
1. Copy of the original purchase invoice
2. Warranty card
3. Video/photo of the fault
4. Clear photo of the serial number label (${product.serialNumber})

Please let me know the next steps to arrange a repair or replacement.

Best regards,
[Your Name]
[Your Phone Number]`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(dynamicClaimEmail);
      toast.success("Claim summary copied to your clipboard.");
    } catch {
      toast.success("Claim summary ready to copy.");
    }
  };

  return (
    <AppShell step={6} eyebrow="Step 6 of 6" title="Warranty Claim Case File" subtitle="Everything the manufacturer needs, packaged into one claim file.">
      <div className="flex items-start gap-4 mb-8">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground shadow-sm">
          <FileCheck2 className="size-8" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl text-foreground">Eligible to prepare claim</h1>
          <p className="mt-2 text-base text-muted-foreground">
            All required documents are attached. You are 100% Claim-Ready. Send it to {product.brand} Support in one go.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-base font-bold text-foreground">Product Information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Product", product.name],
                ["Brand", product.brand],
                ["Serial number", product.serialNumber],
                ["Purchase date", product.purchaseDate],
                ["Price paid", formatINR(product.value)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-bold text-foreground">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-border pt-3 mt-3">
                <dt className="text-muted-foreground">Warranty status</dt>
                <dd className="font-bold text-success">
                  In warranty · until {product.warrantyEnd} ({product.daysLeft} days left)
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-base font-bold text-foreground">Evidence Checklist</h2>
            <ul className="mt-4 space-y-3">
              {proofs.map((p) => (
                <li
                  key={p.label}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3.5 " +
                    (p.ok ? "border-success/30 bg-success/5" : "border-destructive/50 bg-destructive/5")
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
                    {p.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
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
                    {p.ok ? "Included" : "Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border bg-warm px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Case File Preview</p>
                <p className="text-xs text-muted-foreground">
                  claim-ready-{product.id}.pdf · 4 pages
                </p>
              </div>
              <FileCheck2 className="size-5 text-primary" />
            </div>
            <div className="space-y-3 p-6 text-sm">
              {[
                "Page 1 — Claim Summary & Product Passport",
                "Page 2 — Purchase Invoice",
                "Page 3 — Warranty Document",
                "Page 4 — Fault Media & Serial-Number Photo",
              ].map((p) => (
                <div key={p} className="rounded-lg border border-border bg-card px-4 py-3 font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" /> {p}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="flex items-center gap-2 text-base font-bold mb-4">
              <Mail className="size-4 text-primary" /> Pre-filled claim summary
            </p>
            <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground">
              {dynamicClaimEmail}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" className="shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all" onClick={() => toast.success("Case file PDF downloaded (demo).")}>
          <Download className="size-4 mr-2" /> Download Claim Pack
        </Button>
        <Button size="lg" variant="secondary" onClick={copyEmail}>
          <Copy className="size-4 mr-2" /> Copy Claim Summary
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">
            <ArrowLeft className="size-4 mr-2" /> Back to vault
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
