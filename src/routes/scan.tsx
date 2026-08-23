import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, ScanLine, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scanReceipt, type ScannedFields } from "@/lib/scan.functions";
import { addProduct } from "@/lib/warranty-data";
import { buildScannedProduct } from "@/lib/scan-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Extract from Receipt — ClaimReady" },
      {
        name: "description",
        content:
          "Photograph any receipt and ClaimReady extracts the product, price, purchase date and warranty expiry for you.",
      },
      { property: "og:title", content: "Extract from Receipt — ClaimReady" },
      {
        property: "og:description",
        content: "Snap a receipt and build a claim-ready passport automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: ScanPage,
});

const fieldList: { key: keyof ScannedFields; label: string }[] = [
  { key: "product", label: "Product Name" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model Number" },
  { key: "date", label: "Purchase Date" },
  { key: "price", label: "Price Paid" },
  { key: "category", label: "Category" },
  { key: "seller", label: "Seller / Retailer" },
  { key: "warrantyProvider", label: "Warranty Provider" },
  { key: "serialNumber", label: "Serial Number" },
  { key: "warrantyTenure", label: "Warranty Tenure" },
  { key: "expiryDate", label: "Warranty Expiry Date" },
];

const emptyFields: ScannedFields = {
  product: "",
  brand: "",
  model: "",
  date: "",
  price: "",
  category: "",
  seller: "",
  warrantyProvider: "",
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
      eyebrow="AI Extraction"
      title="Extract from Receipt"
      subtitle="Photograph any receipt and ClaimReady extracts all the data needed to build your product passport."
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
              {busy ? "Analyzing receipt..." : "Upload or capture a receipt photo"}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              JPG or PNG · analyzed instantly and discarded
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
              <ArrowLeft className="size-4 mr-2" /> Back to Vault
            </Link>
          </Button>
        </div>

        <div className="surface-card p-6">
          {!fields ? (
            <div className="text-sm text-muted-foreground">
              <h2 className="text-base font-bold text-foreground">Extracted details</h2>
              <p className="mt-3">
                Upload a receipt photo on the left. Anything the receipt does not show is flagged so you can fill it in before a claim needs it.
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
                Edit anything that looks wrong, then generate your product passport.
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
                          "mt-1.5 h-10 bg-card focus-visible:ring-primary " + (missing ? "border-destructive/60" : "")
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all"
                  onClick={() => {
                    if (!fields.product.trim()) {
                      toast.error("Add a product name before saving.");
                      return;
                    }
                    addProduct(buildScannedProduct(fields));
                    toast.success(`${fields.product.trim()} passport generated.`);
                    void navigate({ to: "/" });
                  }}
                >
                  <Sparkles className="size-4 mr-2" /> Generate Product Passport
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
