import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NOM_COOKIE_SESSION } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(NOM_COOKIE_SESSION)?.value;

  if (pathname.startsWith("/sigh")) {
    if (!token) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/connexion" && token) {
    return NextResponse.redirect(new URL("/sigh", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sigh/:path*", "/connexion"],
};
