"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { en } from "@/lib/i18n/en";

type DashboardNav = (typeof en)["dashboardNav"];

export function DashboardHeader({ showEarnings, nav }: { showEarnings: boolean; nav: DashboardNav }) {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_ITEMS = [
    { href: "/dashboard", label: nav.overview },
    { href: "/dashboard/brief", label: nav.brief },
    { href: "/dashboard/billing", label: nav.billing },
    { href: "/dashboard/sites", label: nav.sites },
    { href: "/dashboard/requests", label: nav.requests },
    { href: "/dashboard/account", label: nav.account },
  ];

  const items = showEarnings
    ? [...NAV_ITEMS.slice(0, 3), { href: "/dashboard/earnings", label: nav.earnings }, ...NAV_ITEMS.slice(3)]
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
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-nav-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 -z-10 rounded-md bg-secondary"
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label={nav.logout} onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
