"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Next.js only mounts this in place of the root layout when an error
// escapes every nested error.tsx boundary, so it renders its own
// <html>/<body> and can't assume the app's ThemeProvider/CSS ran.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          fontFamily: "system-ui, sans-serif",
          background: "#0b0b0c",
          color: "#f5f5f5",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#a1a1aa" }}>We&apos;ve been notified and are looking into it.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "0.5rem",
            borderRadius: "9999px",
            border: "1px solid #3f3f46",
            padding: "0.5rem 1.25rem",
            color: "#f5f5f5",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
