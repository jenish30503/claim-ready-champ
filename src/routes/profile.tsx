import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.['full_name']) {
      setName(user.user_metadata['full_name']);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Use window.location instead of navigate so the auth state globally refreshes properly
    window.location.href = "/login";
  };

  return (
    <AppShell title="Your Profile" subtitle="Manage your account settings and preferences.">
      <div className="max-w-2xl mt-8">
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user?.user_metadata?.['full_name']?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.user_metadata?.['full_name'] || "User"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2 max-w-md">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly.</p>
            </div>

            <div className="pt-4 flex gap-3 border-t border-border mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserIcon className="mr-2 size-4" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 size-4" />
                Sign Out
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-6">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Back to Vault
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
