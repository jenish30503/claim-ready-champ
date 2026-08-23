import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Stethoscope, CheckCircle2, XCircle, ArrowRight, FileText, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useProduct,
  proofCount,
  claimReadinessScore,
  resolvedProof,
  useSerialPhotoAdded,
} from "@/lib/warranty-data";

export const Route = createFileRoute("/claim-checkup")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = search["product"];
    return typeof product === "string" ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Claim Checkup — ClaimReady" },
      {
        name: "description",
        content: "Check if your warranty claim has every piece of required proof.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: ClaimCheckup,
});

function ClaimCheckup() {
  const navigate = useNavigate();
  const { product: productId } = Route.useSearch();
  const product = useProduct(productId);
  const serialAdded = useSerialPhotoAdded();
  
  const score = claimReadinessScore(product, serialAdded);
  const readyCount = proofCount(product, serialAdded);
  const resolved = resolvedProof(product, serialAdded);
  const isReady = score === 100;

  return (
    <AppShell
      step={3}
      eyebrow="Step 3 of 6"
      title="Claim Checkup"
      subtitle={`${product.brand} ${product.name} · covered until ${product.warrantyEnd}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <form
            className="surface-card space-y-5 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Claim details saved.");
              if (isReady) {
                navigate({ to: "/case-file", search: { product: product.id } });
              } else {
                navigate({ to: "/missing-evidence", search: { product: product.id } });
              }
            }}
          >
            <h2 className="text-xl font-bold border-b border-border pb-3 mb-4">Claim Details</h2>
            
            <div className="space-y-2">
              <Label htmlFor="issue">What&apos;s the issue?</Label>
              <Input id="issue" defaultValue="Display flickering / image issue" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="started">When did it start?</Label>
              <Input id="started" defaultValue="3 days ago" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media">Do you have a fault photo or video?</Label>
              <Input id="media" defaultValue="Yes" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Anything else? (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                defaultValue="Flicker appears within 2 minutes of switching on, across all inputs."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border mt-4">
              <Button asChild size="lg" variant="outline" type="button">
                <Link to="/passport" search={{ product: product.id }}>
                  <ArrowLeft className="size-4 mr-2" /> Back
                </Link>
              </Button>
              <Button type="submit" size="lg" className="shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all">
                {isReady ? (
                  <>Generate Case File <FileText className="size-4 ml-2" /></>
                ) : (
                  <>Review Missing Proof <ArrowRight className="size-4 ml-2" /></>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6 border-2 border-primary/20">
            <h2 className="text-lg font-bold mb-4">Claim Readiness</h2>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">{readyCount} of 3 evidence</span>
              <span className="text-4xl font-extrabold text-primary">{score}%</span>
            </div>
            
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-6">
              <div className={`h-full rounded-full ${score === 100 ? 'bg-success' : score > 50 ? 'bg-amber-500' : 'bg-destructive'}`} style={{ width: `${score}%` }} />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-success mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Available Evidence
                </h3>
                <ul className="space-y-2 text-sm">
                  {resolved.receipt === 'available' && (
                    <li className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success-foreground font-medium">
                      <CheckCircle2 className="size-4 text-success" /> Purchase Receipt
                    </li>
                  )}
                  {resolved.warrantyCard === 'available' && (
                    <li className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success-foreground font-medium">
                      <CheckCircle2 className="size-4 text-success" /> Warranty Document
                    </li>
                  )}
                  {resolved.serialPhoto === 'available' && (
                    <li className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success-foreground font-medium">
                      <CheckCircle2 className="size-4 text-success" /> Serial Number Photo
                    </li>
                  )}
                </ul>
              </div>

              {!isReady && (
                <div>
                  <h3 className="text-sm font-bold text-destructive mb-3 flex items-center gap-1.5">
                    <XCircle className="size-4" /> Missing Evidence
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {resolved.receipt === 'missing' && (
                      <li className="flex items-center justify-between p-2 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive-foreground font-medium">
                        <span className="flex items-center gap-2"><XCircle className="size-4 text-destructive" /> Purchase Receipt</span>
                      </li>
                    )}
                    {resolved.warrantyCard === 'missing' && (
                      <li className="flex items-center justify-between p-2 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive-foreground font-medium">
                        <span className="flex items-center gap-2"><XCircle className="size-4 text-destructive" /> Warranty Document</span>
                      </li>
                    )}
                    {resolved.serialPhoto === 'missing' && (
                      <li className="flex items-center justify-between p-2 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive-foreground font-medium">
                        <span className="flex items-center gap-2"><XCircle className="size-4 text-destructive" /> Serial Number Photo</span>
                      </li>
                    )}
                  </ul>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Most claims are delayed due to missing proof. Upload them now to become 100% ready.
                    </p>
                    <Button asChild size="lg" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Link to="/upload-proof" search={{ product: product.id }}>
                        Upload Missing Proof
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
              
              {isReady && (
                <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <BadgeCheck className="size-8 text-success mx-auto mb-2" />
                  <p className="font-bold text-success-foreground">You are 100% Claim-Ready!</p>
                  <p className="text-sm text-success-foreground/80 mt-1">All required evidence is collected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
