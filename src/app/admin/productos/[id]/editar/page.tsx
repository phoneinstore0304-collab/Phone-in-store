import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getVariantSiblings } from "@/lib/queries/products";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategories(),
  ]);

  if (!product) notFound();

  const variants = await getVariantSiblings(product);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Editar producto</h1>
      <ProductForm
        action={updateProduct.bind(null, id)}
        categories={categories}
        // price es un Decimal de Prisma: no se puede pasar tal cual a un
        // Client Component (ProductForm es "use client"), hay que
        // convertirlo a number antes de cruzar ese límite.
        product={{ ...product, price: Number(product.price) }}
        variants={variants}
      />
    </div>
  );
}
