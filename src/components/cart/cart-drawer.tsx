"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { formatPrice } from "@/lib/format";
import { useCartStore, cartTotal } from "@/lib/store/cart-store";

// Panel lateral (como en el mockup) en vez de navegar a /carrito. La
// página /carrito se deja igual, para quien entre por URL directa —
// CartLink ahora abre este panel en vez de navegar.
export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="absolute inset-0 bg-black/55 animate-in fade-in duration-200"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-in slide-in-from-right flex-col bg-background duration-250">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h3 className="font-display text-base font-bold text-foreground">Tu carrito</h3>
          <button type="button" aria-label="Cerrar carrito" onClick={closeCart}>
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              Tu carrito está vacío.
              <br />
              Agregá productos del catálogo.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm font-bold">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal(items))}</span>
            </div>
            {/* El checkout real (envío + Mercado Pago) se construye en el
            próximo paso. */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className={`${buttonVariants({ size: "lg" })} w-full justify-center`}
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
