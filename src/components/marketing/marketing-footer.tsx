"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-quote)] text-xl italic">WebSouza</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-16">
          {t.footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>{t.footer.copyright}</p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
