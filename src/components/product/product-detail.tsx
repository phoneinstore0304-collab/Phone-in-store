import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { StockLine } from "@/components/product/stock-line";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getVariantSiblings } from "@/lib/queries/products";

const statusLabel: Record<string, string> = {
  RESERVED: "Reservado por otro comprador",
  SOLD: "Vendido",
};

// Contenido de la ficha de producto, compartido entre la página completa
// (/producto/[slug]) y el modal que la intercepta (ver
// (storefront)/@modal/(.)producto/[slug]/page.tsx) — mismo contenido,
// solo cambia el contenedor alrededor.
export async function ProductDetail({
  product,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
}) {
  const available = product.status === "AVAILABLE";
  const variants = await getVariantSiblings(product);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <ProductGallery images={product.images} alt={product.name} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500">{product.category.name}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900">
            {product.name}
          </h1>
          <div className="flex items-center gap-2">
            {product.isUsed && product.condition && (
              <Badge variant="outline">Grado {product.condition}</Badge>
            )}
            {!available && (
              <Badge variant="secondary">{statusLabel[product.status]}</Badge>
            )}
          </div>
        </div>

        {/* Variantes de color: cada círculo es otro producto real (con su
        propia card en el catálogo), así que clickear navega a esa ficha en
        vez de solo cambiar la imagen acá. El color actual se ve con un
        anillo alrededor; el resto son links. */}
        {(variants.length > 0 || product.color) && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-500">
              Color{product.color ? `: ${product.color}` : ""}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {product.color && (
                <span
                  title={product.color}
                  aria-label={product.color}
                  className="size-8 rounded-full ring-2 ring-zinc-900 ring-offset-2"
                  style={{ backgroundColor: product.colorHex ?? "#d4d4d8" }}
                />
              )}
              {variants.map((variant) => (
                <Link
                  key={variant.id}
                  href={`/producto/${variant.slug}`}
                  title={variant.color ?? "Ver variante"}
                  aria-label={variant.color ?? "Ver variante"}
                  className="size-8 rounded-full ring-1 ring-zinc-300 transition-transform hover:scale-110 hover:ring-zinc-500"
                  style={{ backgroundColor: variant.colorHex ?? "#d4d4d8" }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="w-fit rounded-lg bg-foreground px-4 py-2 text-2xl font-extrabold text-background">
            {formatPrice(product.price.toString())}
          </span>
          {/* Cuotas de referencia (precio ÷ 3), igual que en la tarjeta —
          ver la nota sobre Mercado Pago en product-card.tsx. */}
          <span className="text-xs font-semibold text-zinc-500">
            3 cuotas fijas de {formatPrice(Number(product.price) / 3)} sin interés
          </span>
          <StockLine product={product} />
        </div>

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
