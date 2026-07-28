// Single source of truth for the canonical public URL — used by metadata,
// the sitemap, robots.txt, and the OAuth/email redirect building blocks
// that already read NEXT_PUBLIC_APP_URL directly.
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
