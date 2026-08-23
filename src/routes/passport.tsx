import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, BadgeCheck, Bell, BellOff, CalendarDays, Copy, ShieldCheck, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  formatINR,
  useProduct,
  proofCount,
  claimReadinessScore,
  resolvedProof,
  toggleReminder,
  useReminders,
  useSerialPhotoAdded,
} from "@/lib/warranty-data";

export const Route = createFileRoute("/passport")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = search["product"];
    return typeof product === "string" ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Warranty Passport — ClaimReady" },
      {
        name: "description",
        content: "Digital warranty passport with your product details and collected evidence.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: Passport,
});

function Passport() {
  const navigate = useNavigate();
  const { product: productId } = Route.useSearch();
  const product = useProduct(productId);
  const serialAdded = useSerialPhotoAdded();
  const reminders = useReminders();
  const reminded = reminders.has(product.id);
  const readyCount = proofCount(product, serialAdded);
  const score = claimReadinessScore(product, serialAdded);
  const resolved = resolvedProof(product, serialAdded);
  const urgent = product.daysLeft <= 30;

  const productInfo = [
    { label: "Product Name", value: product.name },
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model || "Unknown" },
    { label: "Serial Number", value: product.serialNumber },
    { label: "Purchase Date", value: product.purchaseDate },
    { label: "Purchase Price", value: formatINR(product.value) },
    { label: "Seller", value: product.seller || "Unknown" },
    { label: "Warranty Provider", value: product.warrantyProvider || "Unknown" },
    { label: "Warranty Start Date", value: product.purchaseDate }, // Assuming start date is purchase date for demo
    { label: "Warranty End Date", value: product.warrantyEnd },
  ];

  return (
    <AppShell
      step={2}
      eyebrow="Step 2 of 6"
      title="Warranty Passport"
      subtitle="Your verified product details and collected evidence, ready for when you need it."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 border-b border-border bg-warm px-6 py-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {product.brand}
              </p>
              <h2 className="text-xl font-extrabold">{product.category}</h2>
            </div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">
              <BadgeCheck className="size-4" /> Verified
            </span>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold px-6 py-4 border-b border-border bg-muted/30">Product Information</h3>
            <dl className="divide-y divide-border">
              {productInfo.map((r) => (
                <div key={r.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-6 py-3.5">
                  <dt className="text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="flex items-center gap-2 text-sm font-bold text-foreground">
                    {r.value}
                    {r.label === "Serial Number" && (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Copy serial number"
                        onClick={(e) => {
                          e.preventDefault();
                          void navigator.clipboard.writeText(product.serialNumber);
                          toast.success("Serial number copied.");
                        }}
                      >
                        <Copy className="size-3.5" />
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-5 mt-auto">
            <Button asChild size="lg" variant="outline">
              <Link to="/">
                <ArrowLeft className="size-4" /> Back to vault
              </Link>
            </Button>
            <Button
              size="lg"
              className="px-8 shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all"
              onClick={() => {
                navigate({ to: "/claim-checkup", search: { product: product.id } });
              }}
            >
              Prepare Claim <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <h3 className="text-base font-bold mb-4">Evidence & Proof</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Claim Readiness</span>
              <span className="text-sm font-bold text-primary">{score}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-6">
              <div className={`h-full rounded-full ${score === 100 ? 'bg-success' : score > 50 ? 'bg-amber-500' : 'bg-destructive'}`} style={{ width: `${score}%` }} />
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm">
                <span className="font-medium">Purchase Receipt</span>
                {resolved.receipt === 'available' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="size-3.5" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full"><XCircle className="size-3.5" /> Missing</span>
                )}
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm">
                <span className="font-medium">Warranty Document</span>
                {resolved.warrantyCard === 'available' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="size-3.5" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full"><XCircle className="size-3.5" /> Missing</span>
                )}
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm">
                <span className="font-medium">Serial Number Photo</span>
                {resolved.serialPhoto === 'available' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="size-3.5" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full"><XCircle className="size-3.5" /> Missing</span>
                )}
              </li>
            </ul>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CalendarDays className={"size-4 " + (urgent ? "text-destructive" : "text-primary")} />
                Warranty Coverage
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  toggleReminder(product.id);
                  toast.success(reminded ? "Reminder off." : "Reminder on.");
                }}
              >
                {reminded ? <Bell className="size-3.5 mr-1 text-primary" /> : <BellOff className="size-3.5 mr-1" />}
                {reminded ? "On" : "Off"}
              </Button>
            </div>
            <p className={"text-2xl font-extrabold mt-1 " + (urgent ? "text-destructive" : "")}>
              {product.daysLeft} days left
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Expires on {product.warrantyEnd}. Raise any service claim before this date.
            </p>
          </div>

          <div className="surface-card px-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="covered" className="border-b-0">
                <AccordionTrigger className="text-sm font-bold">What&apos;s covered</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {product.covered.map((item) => (
                      <li key={item}>✓ {item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="not-covered" className="border-b-0">
                <AccordionTrigger className="text-sm font-bold">Usually not covered</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {product.notCovered.map((item) => (
                      <li key={item}>✕ {item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
