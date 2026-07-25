import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { StockLine } from "@/components/product/stock-line";
import { QuickAddButton } from "@/components/cart/quick-add-button";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/generated/prisma/client";

// Estructura igual al mockup: card blanca con borde redondeado, foto
// bajita (no cuadrada), categoría + nombre + specs, precio en placa +
// cuotas + botón de agregar en la misma fila, stock abajo.
//
// El link a la página del producto cubre toda la tarjeta (position:
// absolute + inset-0), y el resto del contenido queda con
// pointer-events-none para dejar pasar el click — excepto el botón de
// agregar, que lo recupera (pointer-events-auto) para poder usarse sin
// disparar la navegación. Es el patrón estándar para "toda la tarjeta es
// un link menos un botón puntual", sin anidar un <button> dentro de un <a>.
export function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const unavailable = product.status !== "AVAILABLE";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
      <Link
        href={`/producto/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative h-[150px] w-full overflow-hidden bg-zinc-100">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="transition-transform duration-300 ease-out group-hover:scale-105"
        />
        {unavailable && (
          <Badge variant="secondary" className="absolute left-2.5 top-2.5">
            {product.status === "RESERVED" ? "Reservado" : "Vendido"}
          </Badge>
        )}
      </div>

      <div className="pointer-events-none flex flex-col gap-1.5 p-4">
        {categoryName && (
          <span className="text-[10px] font-bold tracking-wide text-zinc-500 uppercase">
            {categoryName}
          </span>
        )}
        <div className="flex items-center gap-2">
          <h3 className="text-[14.5px] leading-tight font-bold text-zinc-900 transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
          {product.isUsed && product.condition && (
            <Badge variant="outline" className="shrink-0">
              Grado {product.condition}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-[11.5px] leading-relaxed text-zinc-500">
          {product.description}
        </p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="w-fit rounded-md bg-foreground px-2.5 py-1 text-[13px] font-extrabold text-background">
              {formatPrice(product.price.toString())}
            </span>
            {/* Cuotas de referencia (precio ÷ 3): Mercado Pago todavía no
            está integrado, así que esto no sale de una cotización real —
            ajustar/quitar cuando se conecte el checkout de verdad. */}
            <span className="text-[10.5px] font-semibold text-zinc-500">
              3 cuotas fijas de {formatPrice(Number(product.price) / 3)} sin interés
            </span>
          </div>
          <div className="pointer-events-auto">
            <QuickAddButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                image: product.images[0],
                isUsed: product.isUsed,
                quantity: product.quantity,
                status: product.status,
              }}
            />
          </div>
        </div>

        <StockLine product={product} />
      </div>
    </div>
  );
}
