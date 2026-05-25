import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Next.js 16: Middleware is now called Proxy
export { proxy };

const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Rutas públicas
  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/cotizador", req.url));
    }
    return NextResponse.next();
  }

  // Todo lo demás requiere autenticación
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
