import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Image as ImageIcon, Plus, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { addSerialPhoto, warrantyClause } from "@/lib/warranty-data";

export const Route = createFileRoute("/upload-proof")({
  head: () => ({
    meta: [
      { title: "Upload proof — Warranty Tracker" },
      {
        name: "description",
        content: "Attach the missing serial-number photo to complete your Samsung TV claim file.",
      },
      { property: "og:title", content: "Upload proof — Warranty Tracker" },
      {
        property: "og:description",
        content: "Attach the missing serial-number photo and complete your claim case file.",
      },
    ],
  }),
  component: UploadProof,
});

function UploadProof() {
  const navigate = useNavigate();

  return (
    <AppShell
      step={5}
      eyebrow="Step 5 of 6"
      title="Upload missing proof"
      subtitle="Product serial-number photo · required by Warranty Requirement 4.2"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card p-6">
          <div className="rounded-xl border-2 border-dashed border-primary/40 bg-accent/40 p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ScanLine className="size-6" />
            </span>
            <p className="mt-4 text-sm font-bold">Photograph the serial-number label</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Usually on the back panel of the TV, near the ports.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
              <ImageIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">samsung-tv-serial-label.jpg</p>
              <p className="text-xs text-muted-foreground">JPG · 1.8 MB · selected</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
              Ready
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                addSerialPhoto();
                toast.success("Serial-number photo added to your case file.");
                navigate({ to: "/case-file" });
              }}
            >
              <Plus className="size-4" /> Add to case file
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/missing-evidence">
                <ArrowLeft className="size-4" /> Back
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
            common reason a claim gets sent back.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
