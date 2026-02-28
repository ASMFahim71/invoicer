import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getSession() reads and locally validates the JWT from cookies — fast,
  // no network call. It is only used here for redirect decisions (protecting
  // routes and bouncing already-logged-in users away from /login).
  // The authoritative getUser() check (network call) still runs inside every
  // server component via getCurrentUser(), so access control stays secure.
  // The only edge-case this can't handle is a genuinely stale token in the
  // cookie — that causes a single extra redirect which the server component
  // then resolves correctly.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/settings") ||
    pathname === "/";

  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  }

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/invoices";
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|invoice/|api/).*)",
  ],
};
