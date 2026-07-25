import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

// Reemplaza el nav de categorías que antes vivía en el header. Vive en la
// home (ver id="catalogo"), así que "Todos" siempre es la opción activa acá
// — las páginas de /categoria/[slug] no repiten esta fila.
export function CategoryPills({ categories }: { categories: Category[] }) {
  return (
    <div id="catalogo" className="scroll-mt-20 px-6 py-6 sm:px-10">
      <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none]">
        <span className="shrink-0 rounded-full border border-foreground bg-foreground px-4.5 py-2 text-sm font-semibold whitespace-nowrap text-background">
          Todos
        </span>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="shrink-0 rounded-full border border-border bg-card px-4.5 py-2 text-sm font-semibold whitespace-nowrap text-foreground/70 transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
