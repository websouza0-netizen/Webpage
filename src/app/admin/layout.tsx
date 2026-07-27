import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

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
      <AdminSidebar
        briefsAwaitingReview={briefsAwaitingReview ?? 0}
        pendingRequests={pendingRequests ?? 0}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </WsEditorial>
  );
}
