import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/claim-checkup")({
  head: () => ({
    meta: [
      { title: "Claim checkup — Warranty Tracker" },
      {
        name: "description",
        content:
          "Describe the fault and we check whether your warranty claim has every piece of required proof.",
      },
      { property: "og:title", content: "Claim checkup — Warranty Tracker" },
      {
        property: "og:description",
        content: "Check whether your warranty claim is ready before you contact support.",
      },
    ],
  }),
  component: ClaimCheckup,
});

function ClaimCheckup() {
  const navigate = useNavigate();

  return (
    <AppShell
      step={3}
      eyebrow="Step 3 of 6"
      title="Claim checkup"
      subtitle="Samsung QLED 55-inch TV · covered until 8 September 2027"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form
          className="surface-card space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Claim checkup complete.");
            navigate({ to: "/missing-evidence" });
          }}
        >
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

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" size="lg">
              <Stethoscope className="size-4" /> Check claim readiness
            </Button>
            <Button asChild size="lg" variant="outline" type="button">
              <Link to="/passport">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
          </div>
        </form>

        <div className="surface-card p-6">
          <h2 className="text-base font-bold">We&apos;ll check for</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Purchase invoice matching the product</li>
            <li>Warranty card with coverage dates</li>
            <li>Fault photo or video evidence</li>
            <li>Product serial-number photograph</li>
          </ul>
          <p className="mt-6 rounded-xl bg-warm p-4 text-sm font-medium">
            Most claims are delayed because one required document is missing — not because the
            product isn&apos;t covered.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
