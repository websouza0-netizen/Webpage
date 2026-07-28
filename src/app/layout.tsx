import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemePreferenceDialog } from "@/components/theme-preference-dialog";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site-url";

const title = "WebSouza — Bespoke websites, run for you";
const description =
  "WebSouza builds and runs your business website end to end: design, delivery, billing, and support in one subscription.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "WebSouza",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MotionConfig reducedMotion="user">
            {children}
            <ThemePreferenceDialog />
            <Toaster />
          </MotionConfig>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
