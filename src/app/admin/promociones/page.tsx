import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePromotion } from "./actions";

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Promociones</h1>
        <Link href="/admin/promociones/nueva" className={buttonVariants()}>
          Nueva promoción
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Vigencia</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{promotion.title}</td>
                <td className="px-4 py-3 text-zinc-500">{promotion.order}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {promotion.activeFrom.toLocaleDateString("es-AR")} –{" "}
                  {promotion.activeTo.toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/promociones/${promotion.id}/editar`}
                      className="text-sm text-zinc-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteButton action={deletePromotion.bind(null, promotion.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay promociones cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
