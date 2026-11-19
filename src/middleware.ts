import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || !adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
  });
  const roles = Array.isArray(token?.roles) ? token.roles as string[] : [];
  if (!token || roles.length === 0) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"], runtime: "nodejs" };
