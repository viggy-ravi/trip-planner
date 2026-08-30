import { auth } from "@/lib/auth";

// Next.js 16 renamed the middleware.ts file convention to proxy.ts (same
// runtime behavior, different file/export name) — see AGENTS.md.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthApiRoute =
    pathname.startsWith("/api/auth") ||
    pathname === "/api/login" ||
    pathname === "/api/register";
  const isPublicPage = pathname === "/login" || pathname === "/signup";

  if (isAuthApiRoute) return;

  if (!isLoggedIn) {
    if (pathname.startsWith("/api")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!isPublicPage) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
    return;
  }

  if (isPublicPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
