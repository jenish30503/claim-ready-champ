import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, CalendarDays, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Product passport — Samsung QLED TV | Warranty Tracker" },
      {
        name: "description",
        content:
          "The digital passport for your Samsung QLED 55-inch TV: purchase date, price and warranty end date.",
      },
      { property: "og:title", content: "Product passport — Samsung QLED TV" },
      {
        property: "og:description",
        content: "Purchase date, price and warranty coverage for your Samsung QLED 55-inch TV.",
      },
    ],
  }),
  component: Passport,
});

const rows = [
  { label: "Brand", value: "Samsung" },
  { label: "Product", value: "QLED 55-inch TV" },
  { label: "Purchase date", value: "9 September 2025" },
  { label: "Price paid", value: "₹72,990" },
  { label: "Warranty end date", value: "8 September 2027" },
];

function Passport() {
  const navigate = useNavigate();

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
                Samsung
              </p>
              <h2 className="text-xl font-extrabold">QLED 55-inch TV</h2>
            </div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">
              <BadgeCheck className="size-4" /> Details extracted
            </span>
          </div>

          <dl className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 px-6 py-4">
                <dt className="text-sm text-muted-foreground">{r.label}</dt>
                <dd className="text-sm font-bold">{r.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 border-t border-border px-6 py-5">
            <Button
              size="lg"
              onClick={() => {
                toast.success("Passport saved to your vault.");
                navigate({ to: "/claim-checkup" });
              }}
            >
              Save and check claim readiness
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/add-product">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-6">
            <p className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="size-4 text-destructive" /> 18 days of coverage left
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Raise any service claim before 8 September 2027 to stay covered under the
              manufacturer warranty.
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-bold">Attached documents</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>samsung-tv-invoice.pdf</li>
              <li>samsung-warranty-card.jpg</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
