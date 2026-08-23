import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Image as ImageIcon, Plus, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { addSerialPhoto, warrantyClause, getProduct } from "@/lib/warranty-data";

export const Route = createFileRoute("/upload-proof")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = search["product"];
    return typeof product === "string" ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Upload Proof — ClaimReady" },
      {
        name: "description",
        content: "Attach missing proof to complete your claim case file.",
      },
    ],
  }),
  component: UploadProof,
});

function UploadProof() {
  const navigate = useNavigate();
  const { product: productId } = Route.useSearch();
  const product = getProduct(productId);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <AppShell
      step={5}
      eyebrow="Step 5 of 6"
      title="Upload Missing Proof"
      subtitle={`${product.brand} ${product.name} · Serial Number Photo Required`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card p-6">
          <label htmlFor="serial-upload" className="block rounded-xl border-2 border-dashed border-primary/40 bg-accent/40 p-8 text-center cursor-pointer transition-colors hover:bg-accent/70">
            <input id="serial-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                 setFileName(file.name);
                 toast.success(`${file.name} selected.`);
              }
              // Reset so the same file can be selected again if needed
              e.target.value = '';
            }} />
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ScanLine className="size-6" />
            </span>
            <p className="mt-4 text-sm font-bold">Photograph the serial-number label</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Usually on the back or bottom panel of the product. Click to upload.
            </p>
          </label>

          {fileName ? (
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-success/5 p-4 border-success/30">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-card text-success">
                <ImageIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-success-foreground">{fileName}</p>
                <p className="text-xs text-success-foreground/80">JPG · Selected</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
                Ready to submit
              </span>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4 opacity-50">
               <p className="text-sm font-bold w-full text-center text-muted-foreground">No file selected yet</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!fileName}
              className="shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all"
              onClick={() => {
                addSerialPhoto();
                toast.success("Missing proof uploaded and verified!");
                navigate({ to: "/case-file", search: { product: product.id } });
              }}
            >
              <Plus className="size-4 mr-2" /> Mark as 100% Claim-Ready
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/missing-evidence" search={{ product: product.id }}>
                <ArrowLeft className="size-4 mr-2" /> Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-base font-bold">Why this is required</h2>
          <blockquote className="mt-3 rounded-xl border-l-4 border-destructive bg-warm p-4 text-sm leading-relaxed font-semibold">
            {warrantyClause}
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            Make sure the full serial string is in focus and readable — blurred labels are the most
            common reason a claim gets delayed or rejected.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
