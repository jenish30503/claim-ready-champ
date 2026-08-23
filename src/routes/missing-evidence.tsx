import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Quote, TriangleAlert, Upload, XCircle } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { 
  warrantyClause, 
  getProduct, 
  resolvedProof, 
  proofCount, 
  claimReadinessScore,
  useSerialPhotoAdded 
} from "@/lib/warranty-data";

export const Route = createFileRoute("/missing-evidence")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = search["product"];
    return typeof product === "string" ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Missing Evidence — ClaimReady" },
      {
        name: "description",
        content: "Your claim is almost ready — one required proof item is still missing.",
      },
    ],
  }),
  component: MissingEvidence,
});

function MissingEvidence() {
  const navigate = useNavigate();
  const { product: productId } = Route.useSearch();
  const product = getProduct(productId);
  const serialAdded = useSerialPhotoAdded();
  
  const score = claimReadinessScore(product, serialAdded);
  const resolved = resolvedProof(product, serialAdded);
  const readyCount = proofCount(product, serialAdded);
  
  if (score === 100) {
    // If somehow they get here but are 100% ready, redirect
    navigate({ to: "/case-file", search: { product: product.id } });
  }

  const checklist = [
    { label: "Purchase receipt", ok: resolved.receipt === 'available' },
    { label: "Warranty document", ok: resolved.warrantyCard === 'available' },
    { label: "Product serial-number photo", ok: resolved.serialPhoto === 'available' },
  ];

  return (
    <AppShell step={4} eyebrow="Step 4 of 6" title="Claim Readiness Review" subtitle={`${product.brand} ${product.name}`}>
      <div className="rounded-2xl border-2 border-destructive/40 bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
            <TriangleAlert className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Your claim is almost ready — missing evidence.
            </h1>
            <p className="mt-2 text-sm font-semibold text-destructive">
              Claim Readiness: {score}% ({readyCount} of 3 required documents available)
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li
                key={c.label}
                className={
                  "flex items-center gap-3 rounded-xl border p-4 transition-colors " +
                  (c.ok
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/50 bg-destructive/10")
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
                  {c.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                </span>
                <span className="text-sm font-bold">{c.label}</span>
                <span
                  className={
                    "ml-auto text-sm font-bold " + (c.ok ? "text-success" : "text-destructive")
                  }
                >
                  {c.ok ? "Verified" : "Missing"}
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
                Missing required evidence will lead to a delayed or rejected claim. Upload the missing documents now to become 100% Claim-Ready.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all" onClick={() => navigate({ to: "/upload-proof", search: { product: product.id } })}>
            <Upload className="size-4 mr-2" /> Upload missing proof
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/claim-checkup" search={{ product: product.id }}>
              <ArrowLeft className="size-4 mr-2" /> Back
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
