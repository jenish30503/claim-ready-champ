import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck, Sparkles, Scan, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    file: "samsung-tv-invoice.pdf",
    meta: "PDF · 248 KB · uploaded just now",
    isUploaded: true,
  },
  {
    id: "warranty",
    icon: ShieldCheck,
    label: "Warranty Card",
    file: "samsung-warranty-card.jpg",
    meta: "JPG · 1.1 MB · uploaded just now",
    isUploaded: true,
  },
];

function AddProduct() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(initialFiles);
  const [serialFile, setSerialFile] = useState<File | null>(null);

  useEffect(() => {
    if (scanState === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState("complete");
            toast.success("Document scanning complete.");
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

          {scanState === "complete" && (
            <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> Scan Results
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Warranty End Date</p>
                    <p className="font-bold mt-1 text-base">08 September 2027</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-success">
                    <CheckCircle2 className="size-3.5" /> Found
                  </span>
                </div>
                <div className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                    <p className="font-bold mt-1 text-base text-destructive">Missing</p>
                    <p className="text-xs text-muted-foreground mt-1">Could not read expiry date from document.</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-2.5 py-1 text-xs font-bold text-destructive">
                    <AlertCircle className="size-3.5" /> Not Found
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {scanState === "idle" ? (
              <Button size="lg" onClick={handleScan}>
                <Scan className="size-4" /> Scan documents
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={scanState === "scanning"}
                onClick={() => {
                  navigate({ to: "/passport" });
                }}
              >
                <Sparkles className="size-4" /> Continue to Passport
              </Button>
            )}
            <Button asChild size="lg" variant="outline" disabled={scanState === "scanning"}>
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

