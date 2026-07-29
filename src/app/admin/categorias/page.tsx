import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Categorías</h1>
        <Link href="/admin/categorias/nueva" className={buttonVariants()}>
          Nueva categoría
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3 text-zinc-500">{category.slug}</td>
                <td className="px-4 py-3 text-zinc-500">{category.order}</td>
                <td className="px-4 py-3 text-zinc-500">{category._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/categorias/${category.id}/editar`}
                      className="text-sm text-zinc-600 hover:underline"
                    >
                      Editar
                    </Link>
                    {/* Si tiene productos, borrarla rompería la FK — se
                    oculta directamente en vez de dejar que el admin lo
                    intente y se encuentre con un error. */}
                    {category._count.products === 0 ? (
                      <DeleteButton action={deleteCategory.bind(null, category.id)} />
                    ) : (
                      <span
                        className="text-sm text-zinc-300"
                        title="Movés o eliminás sus productos primero para poder borrarla"
                      >
                        Eliminar
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay categorías cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
