import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Bell, BellOff, CalendarDays, Copy, ShieldCheck } from "lucide-react";
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
  getProduct,
  proofCount,
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
      { title: "Product passport — Warranty Tracker" },
      {
        name: "description",
        content:
          "The digital passport for your product: purchase date, price and warranty end date.",
      },
      { property: "og:title", content: "Product passport — Warranty Tracker" },
      {
        property: "og:description",
        content: "Purchase date, price and warranty coverage for your product.",
      },
    ],
  }),
  component: Passport,
});

function Passport() {
  const navigate = useNavigate();
  const { product: productId } = Route.useSearch();
  const product = getProduct(productId);
  const serialAdded = useSerialPhotoAdded();
  const reminders = useReminders();
  const reminded = reminders.has(product.id);
  const ready = proofCount(product, serialAdded);
  const isSamsung = product.id === "samsung-tv";
  const urgent = product.daysLeft <= 30;

  const rows = [
    { label: "Brand", value: product.brand },
    { label: "Product", value: product.category },
    { label: "Purchase date", value: product.purchaseDate },
    { label: "Price paid", value: formatINR(product.value) },
    { label: "Warranty end date", value: product.warrantyEnd },
    { label: "Serial number", value: product.serialNumber },
  ];

  return (
    <AppShell
      step={2}
      eyebrow="Step 2 of 6"
      title="Product passport"
      subtitle="Extracted from your invoice and warranty card. Confirm it looks right."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card overflow-hidden">
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
              <BadgeCheck className="size-4" /> Details extracted
            </span>
          </div>

          <dl className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 px-6 py-4">
                <dt className="text-sm text-muted-foreground">{r.label}</dt>
                <dd className="flex items-center gap-2 text-sm font-bold">
                  {r.value}
                  {r.label === "Serial number" && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary"
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

          <div className="flex flex-wrap gap-3 border-t border-border px-6 py-5">
            {isSamsung ? (
              <Button
                size="lg"
                onClick={() => {
                  toast.success("Passport saved to your vault.");
                  navigate({ to: "/claim-checkup" });
                }}
              >
                Save and check claim readiness
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  toggleReminder(product.id);
                  toast.success(
                    reminded
                      ? "Expiry reminder turned off."
                      : `We'll nudge you before ${product.warrantyEnd}.`,
                  );
                }}
              >
                {reminded ? (
                  <>
                    <BellOff className="size-4" /> Turn off reminder
                  </>
                ) : (
                  <>
                    <Bell className="size-4" /> Remind me before expiry
                  </>
                )}
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to={isSamsung ? "/add-product" : "/"}>
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            {isSamsung && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  toggleReminder(product.id);
                  toast.success(
                    reminded
                      ? "Expiry reminder turned off."
                      : `We'll nudge you before ${product.warrantyEnd}.`,
                  );
                }}
              >
                {reminded ? <BellOff className="size-4" /> : <Bell className="size-4" />}
                {reminded ? "Reminder on" : "Set reminder"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-6">
            <p className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className={"size-4 " + (urgent ? "text-destructive" : "text-primary")} />
              {product.daysLeft} days of coverage left
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Raise any service claim before {product.warrantyEnd} to stay covered under the
              manufacturer warranty.
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-bold">Proof on file</p>
            <p className={"mt-1 text-sm font-semibold " + (ready < 3 ? "text-destructive" : "text-success")}>
              {ready}/3 documents ready
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {product.documents.map((d) => (
                <li key={d.name}>
                  {d.kind} — {d.name}
                </li>
              ))}
              {product.documents.length === 0 && <li>No files attached yet.</li>}
            </ul>
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
