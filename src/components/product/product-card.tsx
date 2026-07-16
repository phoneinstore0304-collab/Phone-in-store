import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/generated/prisma/client";

export function ProductCard({ product }: { product: Product }) {
  const unavailable = product.status !== "AVAILABLE";

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {unavailable && (
          <Badge variant="secondary" className="absolute left-3 top-3">
            {product.status === "RESERVED" ? "Reservado" : "Vendido"}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-900">{product.name}</h3>
          {product.isUsed && product.condition && (
            <Badge variant="outline" className="shrink-0">
              Grado {product.condition}
            </Badge>
          )}
        </div>
        <p className="text-sm text-zinc-500">{formatPrice(product.price.toString())}</p>
      </div>
    </Link>
  );
}
