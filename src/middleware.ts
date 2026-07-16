import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Esto solo exige estar autenticado. La verificación de que el usuario
// además tenga role: ADMIN se hace contra la base de datos en el servidor
// (ver src/lib/auth.ts), no acá, porque el rol vive en nuestra tabla User
// y no conviene duplicarlo/confiar en metadata editable del lado cliente.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
