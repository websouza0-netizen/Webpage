import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";
import { SetHtmlLang } from "@/components/set-html-lang";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const locale = await getServerLocale();
  const t = dictionaryFor(locale);

  const serviceRole = createServiceRoleClient();
  const [{ count: briefsAwaitingReview }, { count: pendingRequests }] = await Promise.all([
    serviceRole
      .from("onboarding_briefs")
      .select("id", { count: "exact", head: true })
      .is("reviewed_at", null),
    serviceRole
      .from("edit_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <WsEditorial className="min-h-screen">
      <SetHtmlLang locale={locale} />
      <AdminSidebar
        briefsAwaitingReview={briefsAwaitingReview ?? 0}
        pendingRequests={pendingRequests ?? 0}
        nav={t.adminNav}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </WsEditorial>
  );
}
