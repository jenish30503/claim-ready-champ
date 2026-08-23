import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, LogOut, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-base font-bold tracking-tight">ClaimReady</span>
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
          
          <div className="flex items-center gap-4 ml-auto">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )
            )}
          </div>
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
    </div>
  );
}
