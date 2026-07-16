import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/lib/queries/products";

const statusLabel: Record<string, string> = {
  RESERVED: "Reservado por otro comprador",
  SOLD: "Vendido",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const available = product.status === "AVAILABLE";

  return (
    <div className="grid flex-1 grid-cols-1 gap-10 px-6 py-10 sm:px-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
        <ProductImage src={product.images[0]} alt={product.name} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500">{product.category.name}</p>
          <h1 className="text-3xl font-semibold text-zinc-900">{product.name}</h1>
          <div className="flex items-center gap-2">
            {product.isUsed && product.condition && (
              <Badge variant="outline">Grado {product.condition}</Badge>
            )}
            {!available && (
              <Badge variant="secondary">{statusLabel[product.status]}</Badge>
            )}
          </div>
        </div>

        <p className="text-2xl font-medium text-zinc-900">
          {formatPrice(product.price.toString())}
        </p>

        <p className="whitespace-pre-line text-zinc-600">{product.description}</p>

        {available ? (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              image: product.images[0],
              isUsed: product.isUsed,
              quantity: product.quantity,
            }}
          />
        ) : (
          <p className="w-full rounded-lg bg-zinc-100 px-4 py-3 text-center text-sm text-zinc-500 sm:w-auto">
            {statusLabel[product.status]}
          </p>
        )}

        {product.isUsed && (
          <p className="text-xs text-zinc-400">
            Producto Apple usado, no nuevo ni sellado de fábrica. Ver estado y
            garantía en los Términos y condiciones.
          </p>
        )}
      </div>
    </div>
  );
}
