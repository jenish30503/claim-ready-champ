import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck, Sparkles, Scan, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addProduct, type Product } from "@/lib/warranty-data";

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

const initialFiles = [
  {
    id: "invoice",
    icon: FileText,
    label: "Invoice / Receipt",
    file: "No file selected",
    meta: "Required for claims (PDF, JPG)",
    isUploaded: false,
  },
  {
    id: "warranty",
    icon: ShieldCheck,
    label: "Warranty Card",
    file: "No file selected",
    meta: "Required for claims (PDF, JPG)",
    isUploaded: false,
  },
];

function AddProduct() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete" | "failed">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(initialFiles);
  const [serialFile, setSerialFile] = useState<File | null>(null);

  // Manual fallback form state
  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    category: "",
    value: "",
    purchaseDate: "",
    warrantyEnd: "",
    serialNumber: "",
  });

  useEffect(() => {
    if (scanState === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState("failed");
            toast.error("Failed to extract product details from document.");
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  const handleScan = () => {
    setScanProgress(0);
    setScanState("scanning");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (id === "serial") {
        setSerialFile(file);
      } else {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === id) {
            return {
              ...f,
              file: file.name,
              meta: `${file.name.split('.').pop()?.toUpperCase() || 'FILE'} · ${(file.size / 1024).toFixed(1)} KB · uploaded just now`,
              isUploaded: true,
            };
          }
          return f;
        }));
      }
      toast.success(`${file.name} uploaded successfully.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new product
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      brand: formData.brand || "Unknown Brand",
      name: formData.name || "Unknown Product",
      model: "Unknown Model",
      category: formData.category || "Other",
      seller: "Unknown Seller",
      warrantyProvider: "Unknown Provider",
      value: parseInt(formData.value) || 0,
      daysLeft: 365, // Simplified for demo
      purchaseDate: formData.purchaseDate || "Unknown Date",
      warrantyEnd: formData.warrantyEnd || "Unknown Date",
      serialNumber: formData.serialNumber || "Missing",
      documents: uploadedFiles
        .filter(f => f.isUploaded)
        .map(f => ({ name: f.file, kind: f.label })),
      covered: ["Manufacturing defects"],
      notCovered: ["Physical / liquid damage"],
      proof: { 
        receipt: uploadedFiles[0].isUploaded ? "available" : "missing", 
        warrantyCard: uploadedFiles[1].isUploaded ? "available" : "missing", 
        serialPhoto: serialFile ? "available" : "missing" 
      },
    };
    
    addProduct(newProduct);
    toast.success("Product manually added to your vault.");
    navigate({ to: "/" });
  };

  return (
    <AppShell
      step={1}
      eyebrow="Step 1 of 6"
      title="Add product"
      subtitle="Drop in whatever paperwork you have. We read the brand, model, purchase date and warranty window for you."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Uploaded documents</h2>
            {scanState === "scanning" && (
              <span className="flex items-center gap-2 text-sm font-medium text-primary animate-pulse">
                <Loader2 className="size-4 animate-spin" /> Scanning...
              </span>
            )}
          </div>
          
          <div className="mt-4 relative space-y-3">
            {scanState === "scanning" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl border border-border">
                <Scan className="size-10 text-primary mb-4 animate-pulse" />
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100 ease-linear" 
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">Extracting details... {scanProgress}%</p>
              </div>
            )}
            
            {uploadedFiles.map((f) => (
              <label
                key={f.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4 transition-all cursor-pointer hover:bg-muted",
                  scanState === "scanning" && "opacity-30 pointer-events-none"
                )}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, f.id)} 
                  accept="image/*,.pdf"
                />
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary">
                  <f.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{f.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{f.file}</p>
                  <p className="text-xs text-muted-foreground">{f.meta}</p>
                </div>
                <span className={cn("ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", 
                  f.isUploaded ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")}>
                  {f.isUploaded ? "Change" : "Upload"}
                </span>
              </label>
            ))}

            <label className={cn(
              "block rounded-xl border border-dashed border-border p-6 text-center transition-all cursor-pointer hover:bg-muted/50",
              scanState === "scanning" && "opacity-30 pointer-events-none"
            )}>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'serial')} 
                accept="image/*"
              />
              {serialFile ? (
                <>
                  <p className="text-sm font-semibold text-success">{serialFile.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Uploaded successfully - click to change</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Serial-number photo</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Optional now — we&apos;ll flag it if a claim needs it. (Click to upload)
                  </p>
                </>
              )}
            </label>
          </div>

          {scanState === "failed" && (
            <div className="mt-6 rounded-xl border border-destructive bg-destructive/10 overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    <AlertCircle className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-destructive">Extraction Failed</h3>
                    <p className="text-xs text-destructive/80 mt-0.5">We couldn't read the details from your documents. Please enter them manually below.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanState === "failed" && (
            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" value={formData.brand} onChange={e => setFormData(f => ({...f, brand: e.target.value}))} required placeholder="e.g. Samsung" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} required placeholder="e.g. 55-inch QLED TV" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value}))} placeholder="e.g. Electronics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Price / Value (₹)</Label>
                  <Input id="value" type="number" value={formData.value} onChange={e => setFormData(f => ({...f, value: e.target.value}))} placeholder="e.g. 72990" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" value={formData.purchaseDate} onChange={e => setFormData(f => ({...f, purchaseDate: e.target.value}))} placeholder="e.g. 9 Sep 2025" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyEnd">Warranty End Date</Label>
                  <Input id="warrantyEnd" value={formData.warrantyEnd} onChange={e => setFormData(f => ({...f, warrantyEnd: e.target.value}))} required placeholder="e.g. 8 Sep 2027" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" value={formData.serialNumber} onChange={e => setFormData(f => ({...f, serialNumber: e.target.value}))} placeholder="e.g. SN55Q70-IN-4419" />
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button type="submit" size="lg">
                  <Sparkles className="size-4 mr-2" /> Save manually to vault
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/">
                    <ArrowLeft className="size-4 mr-2" /> Cancel
                  </Link>
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {scanState === "idle" && (
              <Button size="lg" onClick={handleScan}>
                <Scan className="size-4" /> Scan documents
              </Button>
            )}
            {scanState === "scanning" && (
              <Button size="lg" disabled>
                <Loader2 className="size-4 animate-spin" /> Scanning...
              </Button>
            )}
            {scanState === "complete" && (
              <>
                <Button
                  size="lg"
                  onClick={() => {
                    toast.success("Product saved to your vault.");
                    navigate({ to: "/" });
                  }}
                >
                  <Sparkles className="size-4" /> Save to vault
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    navigate({ to: "/passport" });
                  }}
                >
                  <ShieldCheck className="size-4" /> Claim warranty
                </Button>
              </>
            )}
            {(scanState === "idle" || scanState === "complete") && (
              <Button asChild size="lg" variant="outline" disabled={scanState === "scanning"}>
                <Link to="/">
                  <ArrowLeft className="size-4" /> Back to vault
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-base font-bold">What happens next</h2>
          <ol className="mt-4 space-y-4 text-sm">
            {[
              "We scan your documents using AI OCR.",
              "We extract dates like warranty end and expiry.",
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

