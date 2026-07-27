"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/brief", label: "Brief" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/sites", label: "Sites" },
  { href: "/dashboard/requests", label: "Requests" },
  { href: "/dashboard/account", label: "Account" },
];

export function DashboardHeader({ showEarnings }: { showEarnings: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = showEarnings
    ? [...NAV_ITEMS.slice(0, 3), { href: "/dashboard/earnings", label: "Earnings" }, ...NAV_ITEMS.slice(3)]
    : NAV_ITEMS;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          WebSouza
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-1 overflow-x-auto text-sm">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
