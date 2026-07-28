import { redirect } from "next/navigation";
import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { DashboardHeader } from "@/components/dashboard/header";
import { getDashboardContext } from "@/lib/dashboard-data";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";
import { SetHtmlLang } from "@/components/set-html-lang";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, subscription, readOnly } = await getDashboardContext();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const locale = await getServerLocale();
  const t = dictionaryFor(locale);

  return (
    <WsEditorial className="min-h-screen">
      <SetHtmlLang locale={locale} />
      <DashboardHeader showEarnings={subscription?.plan === "ecommerce"} nav={t.dashboardNav} />
      {readOnly && (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-center text-sm text-destructive sm:px-6">
          {t.dashboard.banner.prefix} {subscription?.status === "past_due" ? t.dashboard.banner.pastDue : t.dashboard.banner.inactive} —{" "}
          {t.dashboard.banner.suffix}
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </WsEditorial>
  );
}
