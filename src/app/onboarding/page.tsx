import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";
import { SetHtmlLang } from "@/components/set-html-lang";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/onboarding");

  const locale = await getServerLocale();
  const t = dictionaryFor(locale).onboarding;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <WsEditorial className="min-h-screen">
      <SetHtmlLang locale={locale} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <ThemeToggle />
        </Reveal>
        <Reveal delay={0.05}>
          <OnboardingForm isEcommerce={subscription?.plan === "ecommerce"} accountEmail={user.email ?? ""} />
        </Reveal>
      </div>
    </WsEditorial>
  );
}
