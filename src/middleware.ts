// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

const PROTECTED = ["/profil", "/yorumlarim", "/admin"];

function isProtected(pathname: string) {
  return PROTECTED.some((p) => pathname.startsWith(p));
}
function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set(
      "redirect",
      pathname + (searchParams.toString() ? `?${searchParams}` : "")
    );
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    // admin kontrolü
    if (isAdminPath(pathname)) {
      const role = String(payload.role || "").toLowerCase();
      if (role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/giris";
        url.searchParams.set("redirect", "/");
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/giris";
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/profil/:path*", "/yorumlarim/:path*", "/admin/:path*"],
};
