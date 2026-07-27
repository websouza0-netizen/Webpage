import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemePreferenceDialog } from "@/components/theme-preference-dialog";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "WebSouza — Bespoke websites, run for you",
  description:
    "WebSouza builds and runs your business website end to end: design, delivery, billing, and support in one subscription.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <ThemePreferenceDialog />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
