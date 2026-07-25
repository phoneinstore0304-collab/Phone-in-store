import { clerkMiddleware } from "@clerk/nextjs/server";

// clerkMiddleware() sigue haciendo falta para que Clerk funcione (setea la
// sesión), pero la protección de rutas ya NO se hace acá con
// createRouteMatcher (deprecado por Clerk: el matching por path puede
// divergir del ruteo real de Next.js). Ahora cada recurso protegido se
// cuida a sí mismo con auth.protect() — ver requireAdmin() en
// src/lib/auth.ts, usado en el layout de /admin y en cada Server Action.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
