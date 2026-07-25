import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { Category, Product } from "@/generated/prisma/client";

export function CategorySection({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 px-6 py-10 sm:px-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-zinc-900">
          {category.name}
        </h2>
        <Link
          href={`/categoria/${category.slug}`}
          className="group/link text-sm text-zinc-500 transition-colors duration-200 hover:text-primary"
        >
          Ver todo
          <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.5">
            {" "}
            →
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} categoryName={category.name} />
        ))}
      </div>
    </section>
  );
}
