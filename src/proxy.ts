import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Triggers a token refresh if the session is stale; must be called
  // before any routing decision below so cookies are current.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && AUTH_PAGES.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isOnboarding = pathname === "/onboarding";

  if (isDashboard || isOnboarding) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: gate } = await supabase.rpc("onboarding_gate_status");
    const status = gate?.[0] as
      | { has_active_sub: boolean; has_brief: boolean; brief_locked: boolean }
      | undefined;

    if (status?.has_active_sub && !status.has_brief && !isOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    if (isOnboarding && status?.has_brief) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
