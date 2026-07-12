import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const JWT_SECRET = process.env.JWT_SECRET;
const encodedSecret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

const ADMIN_HOME = "/admin";
const CLIENT_HOME = "/dashboard";

interface SessionPayload {
  sub: string;
  role: "ADMIN" | "CLIENT";
}

// Verificación de solo firma/expiración (rápida, en el edge). El chequeo
// autoritativo de "¿sigue activo este usuario?" vive en requireUser/
// requireAdmin (src/lib/auth/session.ts), que sí consulta la base de datos
// en cada request a la API. Esto es una primera barrera para que nadie sin
// sesión válida ni con el rol equivocado llegue a ver la página.
async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token || !encodedSecret) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (typeof payload.sub !== "string" || (payload.role !== "ADMIN" && payload.role !== "CLIENT")) {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSession(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(
        new URL(session.role === "ADMIN" ? ADMIN_HOME : CLIENT_HOME, request.url),
      );
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(CLIENT_HOME, request.url));
  }

  if (pathname.startsWith("/dashboard") && session.role !== "CLIENT") {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"],
};
