import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { FilterBar } from "@/components/product/filter-bar";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/queries/products";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ minPrice?: string; maxPrice?: string; condition?: string }>;
}) {
  const { slug } = await params;
  const { minPrice, maxPrice, condition } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id, {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    condition: condition || undefined,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 pt-10 sm:px-10">
        <h1 className="text-2xl font-semibold text-zinc-900">{category.name}</h1>
      </div>
      <FilterBar minPrice={minPrice} maxPrice={maxPrice} condition={condition} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-6 pb-16 sm:grid-cols-3 sm:px-10 lg:grid-cols-4">
        {products.length === 0 ? (
          <p className="col-span-full text-zinc-500">
            No hay productos disponibles con estos filtros.
          </p>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </div>
    </div>
  );
}
