import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export const steps = [
  { to: "/", label: "Vault" },
  { to: "/add-product", label: "Add product" },
  { to: "/passport", label: "Passport" },
  { to: "/claim-checkup", label: "Claim checkup" },
  { to: "/missing-evidence", label: "Evidence" },
  { to: "/upload-proof", label: "Upload proof" },
  { to: "/case-file", label: "Case file" },
] as const;

export function AppShell({
  children,
  step,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  step?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-base font-bold tracking-tight">Warranty Tracker</span>
          </Link>
          {step !== undefined && (
            <div className="hidden items-center gap-1.5 md:flex">
              {steps.map((s, i) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                    (i === step
                      ? "bg-primary text-primary-foreground"
                      : i < step
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted")
                  }
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
                {eyebrow}
              </p>
            )}
            {title && <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>}
            {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-muted-foreground">
        Demo prototype · sample data only, nothing leaves this device.
      </footer>
    </div>
  );
}
