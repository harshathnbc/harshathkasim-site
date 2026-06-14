import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

function pathHasLocale(pathname: string) {
  return locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
}

function detectLocale(request: NextRequest) {
  const header = (request.headers.get("accept-language") || "").toLowerCase();
  return header.startsWith("ar") || header.includes(",ar") ? "ar" : defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathHasLocale(pathname)) return NextResponse.next();

  const locale = detectLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and any path with a file extension (assets).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
