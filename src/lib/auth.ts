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

  // El admin puede cargar clientes a mano desde /admin/usuarios antes de
  // que se hayan registrado (quedan con clerkId null). Si esta persona
  // ahora inicia sesión de verdad con el mismo email, "reclamamos" esa
  // fila en vez de crear un usuario duplicado — así no pierde los puntos
  // ni el historial que ya tenía cargado.
  const manuallyCreated = await prisma.user.findUnique({ where: { email } });
  if (manuallyCreated && !manuallyCreated.clerkId) {
    return prisma.user.update({
      where: { id: manuallyCreated.id },
      data: { clerkId: userId, name: manuallyCreated.name ?? name },
    });
  }

  return prisma.user.create({ data: { clerkId: userId, email, name } });
}

// El rol de admin se valida siempre acá, contra la tabla User, nunca solo
// en el cliente. Si no es admin, redirige en vez de mostrar el panel.
//
// auth.protect() reemplaza lo que antes hacía el middleware con
// createRouteMatcher (deprecado por Clerk): exige sesión iniciada acá
// mismo, en el recurso que se está protegiendo, en vez de adivinarlo por
// path en un archivo central. Si no hay sesión, Clerk redirige a sign-in
// (o devuelve 401 si esto se llama desde una Server Action).
export async function requireAdmin() {
  await auth.protect();

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
