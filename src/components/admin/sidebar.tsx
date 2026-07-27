"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/briefs", label: "Briefs" },
  { href: "/admin/requests", label: "Edit requests" },
  { href: "/admin/sites/new", label: "Sites" },
  { href: "/admin/email-log", label: "Email log" },
];

export function AdminSidebar({
  briefsAwaitingReview,
  pendingRequests,
}: {
  briefsAwaitingReview?: number;
  pendingRequests?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          WebSouza
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            admin
          </Badge>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-1 overflow-x-auto text-sm">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const count =
              item.href === "/admin/briefs"
                ? briefsAwaitingReview
                : item.href === "/admin/requests"
                  ? pendingRequests
                  : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 -z-10 rounded-md bg-secondary"
                  />
                )}
                {item.label}
                {!!count && (
                  <Badge variant="default" className="h-4 min-w-4 px-1 text-[10px]">
                    {count}
                  </Badge>
                )}
              </Link>
            );
          })}
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
