import { redirect } from "next/navigation";
import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { DashboardHeader } from "@/components/dashboard/header";
import { getDashboardContext } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, subscription, readOnly } = await getDashboardContext();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <WsEditorial className="min-h-screen">
      <DashboardHeader showEarnings={subscription?.plan === "ecommerce"} />
      {readOnly && (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-center text-sm text-destructive sm:px-6">
          Your subscription is {subscription?.status === "past_due" ? "past due" : "no longer active"} — you
          can still view your site, brief, and invoices, but change requests and add-ons are paused until
          billing is resolved.
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </WsEditorial>
  );
}
