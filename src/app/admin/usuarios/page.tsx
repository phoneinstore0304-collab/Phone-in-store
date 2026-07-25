import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PointsAdjustForm } from "@/components/admin/points-adjust-form";
import { adjustPoints } from "./actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Usuarios</h1>
        <Link href="/admin/usuarios/nuevo" className={buttonVariants()}>
          Nuevo cliente
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
              <th className="px-4 py-3 font-medium">Puntos</th>
              <th className="px-4 py-3 font-medium">Ajustar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-500">{user.email}</td>
                <td className="px-4 py-3 text-zinc-500">{user.role}</td>
                <td className="px-4 py-3">
                  {user.clerkId ? (
                    <Badge variant="outline">Registrado</Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente</Badge>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">{user.points}</td>
                <td className="px-4 py-3">
                  <PointsAdjustForm action={adjustPoints.bind(null, user.id)} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay usuarios cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
