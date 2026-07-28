"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/motion/reveal";

function nextDestination(searchParams: URLSearchParams) {
  const plan = searchParams.get("plan");
  const interval = searchParams.get("interval");
  if (plan) {
    const qs = new URLSearchParams({ plan, interval: interval ?? "monthly" });
    return `/dashboard/billing?${qs.toString()}`;
  }
  return "/dashboard";
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = nextDestination(searchParams);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // If email confirmation is required, signUp returns a user but no
    // session — there's nothing to bootstrap yet and /dashboard would just
    // bounce back to /login, so tell the user to check their inbox instead.
    if (!data.session) {
      setLoading(false);
      setConfirmationSent(true);
      return;
    }
    await fetch("/api/auth/bootstrap", { method: "POST" });
    setLoading(false);
    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <WsEditorial className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Reveal className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>Create your WebSouza account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {confirmationSent ? (
            <p className="text-center text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>.
              Follow it to finish creating your account, then log in.
            </p>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleGoogle}>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
      </Reveal>
    </WsEditorial>
  );
}
