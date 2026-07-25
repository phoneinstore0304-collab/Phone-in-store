"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";
import { useCartStore, type CartItem } from "@/lib/store/cart-store";

export function CartItemRow({ item }: { item: CartItem }) {
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const closeCart = useCartStore((state) => state.closeCart);

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        <ProductImage src={item.image} alt={item.name} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/producto/${item.slug}`}
          onClick={closeCart}
          className="font-medium hover:underline"
        >
          {item.name}
        </Link>
        <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
      </div>

      {item.maxQuantity > 1 ? (
        <select
          value={item.quantity}
          onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
          className="h-8 rounded-lg border border-zinc-300 px-2 text-sm"
        >
          {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm text-zinc-500">Cant.: 1</span>
      )}

      <p className="w-24 text-right font-medium">
        {formatPrice(item.price * item.quantity)}
      </p>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        aria-label="Quitar del carrito"
        className="text-zinc-400 hover:text-red-500"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
