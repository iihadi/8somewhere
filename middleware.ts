import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/edit/login";
  const isAuthApi = pathname === "/api/edit/auth";
  const protectedPage = pathname.startsWith("/edit") && !isLoginPage;
  const protectedApi = pathname.startsWith("/api/edit") && !isAuthApi;

  if (!protectedPage && !protectedApi) return NextResponse.next();

  const valid = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (valid) return NextResponse.next();

  if (protectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/edit/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/edit/:path*", "/api/edit/:path*"],
};
