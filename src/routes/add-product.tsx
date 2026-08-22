import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/add-product")({
  head: () => ({
    meta: [
      { title: "Add product — Warranty Tracker" },
      {
        name: "description",
        content: "Upload your invoice and warranty card, and let Warranty Tracker read the details.",
      },
      { property: "og:title", content: "Add product — Warranty Tracker" },
      {
        property: "og:description",
        content: "Add a new product to your warranty vault in seconds.",
      },
    ],
  }),
  component: AddProduct,
});

const files = [
  {
    icon: FileText,
    label: "Invoice / Receipt",
    file: "samsung-tv-invoice.pdf",
    meta: "PDF · 248 KB · uploaded just now",
  },
  {
    icon: ShieldCheck,
    label: "Warranty Card",
    file: "samsung-warranty-card.jpg",
    meta: "JPG · 1.1 MB · uploaded just now",
  },
];

function AddProduct() {
  const navigate = useNavigate();

  return (
    <AppShell
      step={1}
      eyebrow="Step 1 of 6"
      title="Add product"
      subtitle="Drop in whatever paperwork you have. We read the brand, model, purchase date and warranty window for you."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card p-6">
          <h2 className="text-base font-bold">Uploaded documents</h2>
          <div className="mt-4 space-y-3">
            {files.map((f) => (
              <div
                key={f.file}
                className="flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                  <f.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{f.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{f.file}</p>
                  <p className="text-xs text-muted-foreground">{f.meta}</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
                  Uploaded
                </span>
              </div>
            ))}

            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm font-semibold">Serial-number photo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional now — we&apos;ll flag it if a claim needs it.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                toast.success("Product details extracted from your invoice.");
                navigate({ to: "/passport" });
              }}
            >
              <Sparkles className="size-4" /> Extract product details
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">
                <ArrowLeft className="size-4" /> Back to vault
              </Link>
            </Button>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-base font-bold">What happens next</h2>
          <ol className="mt-4 space-y-4 text-sm">
            {[
              "We read your documents and build a product passport.",
              "You confirm the details and save them to your vault.",
              "We check whether your claim proof is complete.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-center gap-2 rounded-xl bg-warm p-4 text-sm font-medium">
            <ArrowRight className="size-4 shrink-0 text-primary" />
            Everything stays on this device in the demo.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
