import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Devuelve el usuario de nuestra base (no el de Clerk) para tener siempre
// disponible el `role` y los demás campos propios de la app. El webhook de
// Clerk (src/app/api/webhooks/clerk/route.ts) es la vía normal de alta, pero
// si todavía no corrió (webhook con delay, o entorno local sin URL pública
// para recibirlo) lo creamos acá mismo con role: CUSTOMER por defecto.
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
  return prisma.user.create({ data: { clerkId: userId, email, name } });
}

// El rol de admin se valida siempre acá, contra la tabla User, nunca solo
// en el cliente. Si no es admin, redirige en vez de mostrar el panel.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
