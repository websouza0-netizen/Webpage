import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { DEMO_PROJECTS } from "@/lib/demo-projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/signup`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    ...DEMO_PROJECTS.map((project) => ({
      url: `${SITE_URL}/demo/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
