"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { formatPrice } from "@/lib/format";
import { useCartStore, cartTotal } from "@/lib/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-zinc-500">Tu carrito está vacío.</p>
        <Link href="/" className="text-sm underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
        Tu carrito
      </h1>

      <div className="flex flex-col divide-y divide-zinc-200">
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </div>

      <div className="flex flex-col items-end gap-4 border-t border-zinc-200 pt-6">
        <p className="text-lg font-bold">
          Total: <span className="text-primary">{formatPrice(cartTotal(items))}</span>
        </p>
        {/* El checkout real (envío + Mercado Pago) se construye en el próximo paso. */}
        <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
          Continuar la compra
        </Link>
      </div>
    </div>
  );
}
