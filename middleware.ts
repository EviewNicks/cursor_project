import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isProtectedRoute = request.nextUrl.pathname === "/protected";

  if (isProtectedRoute) {
    // Cek validasi dari cookie/session
    const hasValidApiKey = request.cookies.get("validApiKey")?.value === "true";

    if (!hasValidApiKey) {
      return NextResponse.redirect(new URL("/playground", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/protected",
};
