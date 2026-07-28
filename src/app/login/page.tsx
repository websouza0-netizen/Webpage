"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/motion/reveal";
import { I18nProvider, useI18n } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <I18nProvider>
      <Suspense>
        <LoginForm />
      </Suspense>
    </I18nProvider>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const { locale, setLocale, t } = useI18n();
  const auth = t.auth.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
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
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <LanguageToggle locale={locale} onToggle={() => setLocale(locale === "en" ? "pt" : "en")} />
        <ThemeToggle />
      </div>
      <Reveal className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{auth.title}</CardTitle>
          <CardDescription>{auth.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button type="button" variant="outline" onClick={handleGoogle}>
            {auth.continueWithGoogle}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            {auth.or}
            <div className="h-px flex-1 bg-border" />
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{auth.email}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{auth.password}</Label>
                <Link
                  href="/reset-password/request"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {auth.forgotPassword}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? auth.submitting : auth.submit}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {auth.noAccount}{" "}
            <Link href="/signup" className="text-foreground underline underline-offset-4">
              {auth.getStarted}
            </Link>
          </p>
        </CardContent>
      </Card>
      </Reveal>
    </WsEditorial>
  );
}
