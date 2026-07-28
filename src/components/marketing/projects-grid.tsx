"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getDemoProject } from "@/lib/demo-projects";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectsGrid() {
  const { t } = useI18n();

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t.projects.title}</h2>
        <p className="mt-4 text-muted-foreground">{t.projects.subtitle}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.projects.items.map((p) => {
          const demo = getDemoProject(p.id);
          return (
            <motion.div key={p.id} className="group" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Link href={`/demo/${p.id}`}>
                <Card className="h-full gap-0 overflow-hidden py-0">
                  <div className="h-28 w-full overflow-hidden">
                    <div
                      className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
                      style={
                        demo
                          ? {
                              background: `linear-gradient(135deg, ${demo.colors.background}, ${demo.colors.accent})`,
                            }
                          : undefined
                      }
                    />
                  </div>
                  <CardHeader className="gap-1.5 py-6">
                    <Badge variant="outline" className="w-fit">
                      {p.category}
                    </Badge>
                    <CardTitle className="mt-1 flex items-center gap-1.5">
                      {p.name}
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
