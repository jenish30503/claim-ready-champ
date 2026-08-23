import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, ScanLine, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scanReceipt, type ScannedFields } from "@/lib/scan.functions";
import { addScannedProduct, buildScannedProduct } from "@/lib/scan-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a receipt — Warranty Tracker" },
      {
        name: "description",
        content:
          "Photograph any receipt and Warranty Tracker reads the product, price, purchase date and warranty expiry for you.",
      },
      { property: "og:title", content: "Scan a receipt — Warranty Tracker" },
      {
        property: "og:description",
        content: "Snap a receipt and add a new product to your warranty vault automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

const fieldList: { key: keyof ScannedFields; label: string }[] = [
  { key: "product", label: "Product name" },
  { key: "brand", label: "Brand" },
  { key: "date", label: "Purchase date" },
  { key: "price", label: "Price" },
  { key: "category", label: "Category" },
  { key: "serialNumber", label: "Serial number" },
  { key: "warrantyTenure", label: "Warranty tenure" },
  { key: "expiryDate", label: "Warranty expiry date" },
];

const emptyFields: ScannedFields = {
  product: "",
  brand: "",
  date: "",
  price: "",
  category: "",
  serialNumber: "",
  warrantyTenure: "",
  expiryDate: "",
};

function ScanPage() {
  const navigate = useNavigate();
  const runScan = useServerFn(scanReceipt);
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<ScannedFields | null>(null);

  async function handleFile(file: File) {
    setFields(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file."));
        reader.readAsDataURL(file);
      });
      const result = await runScan({
        data: { imageBase64: dataUrl.split(",")[1] ?? "", mediaType: file.type || "image/jpeg" },
      });
      setFields({ ...emptyFields, ...result });
      toast.success("Receipt scanned — check the details below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed. Try another photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      eyebrow="New"
      title="Scan a receipt"
      subtitle="Take a photo of any bill or invoice. We read the product, price, purchase date and warranty window, then add it to your vault."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="surface-card p-6">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-primary/40 bg-accent/40 p-8 text-center transition-colors hover:bg-accent/70"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              {busy ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <ScanLine className="size-6" />
              )}
            </span>
            <span className="mt-4 block text-sm font-bold">
              {busy ? "Reading your receipt…" : "Choose or capture a receipt photo"}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              JPG or PNG · stays on this device apart from the scan itself
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Receipt image"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Selected receipt preview"
              className="mt-5 max-h-80 w-full rounded-xl border border-border object-contain"
            />
          )}

          <Button asChild variant="outline" size="lg" className="mt-6 w-full">
            <Link to="/">
              <ArrowLeft className="size-4" /> Back to vault
            </Link>
          </Button>
        </div>

        <div className="surface-card p-6">
          {!fields ? (
            <div className="text-sm text-muted-foreground">
              <h2 className="text-base font-bold text-foreground">Extracted details</h2>
              <p className="mt-3">
                Pick a receipt photo on the left. Anything the receipt does not show is flagged so
                you can fill it in before a claim needs it.
              </p>
              <ul className="mt-4 space-y-2">
                {fieldList.map((f) => (
                  <li key={f.key} className="flex items-center gap-2">
                    <Upload className="size-3.5 text-primary" /> {f.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h2 className="text-base font-bold">Extracted details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit anything that looks wrong, then save it to your vault.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {fieldList.map((f) => {
                  const value = fields[f.key];
                  const missing = value.trim() === "";
                  return (
                    <div key={f.key}>
                      <Label htmlFor={f.key} className="text-xs font-semibold">
                        {f.label}
                        {missing && (
                          <span className="ml-1 font-bold text-destructive">· missing</span>
                        )}
                      </Label>
                      <Input
                        id={f.key}
                        value={value}
                        onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        className={
                          "mt-1.5 h-10 bg-card " + (missing ? "border-destructive/60" : "")
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    if (!fields.product.trim()) {
                      toast.error("Add a product name before saving.");
                      return;
                    }
                    addScannedProduct(buildScannedProduct(fields));
                    toast.success(`${fields.product.trim()} added to your vault.`);
                    void navigate({ to: "/" });
                  }}
                >
                  <Sparkles className="size-4" /> Save to vault
                </Button>
                <Button size="lg" variant="outline" onClick={() => setFields(null)}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
