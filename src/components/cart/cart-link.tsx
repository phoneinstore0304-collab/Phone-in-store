"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore, cartCount } from "@/lib/store/cart-store";

// Antes navegaba a /carrito; ahora abre el panel lateral (ver CartDrawer).
// La ruta /carrito se mantiene para quien entre por URL directa.
export function CartLink() {
  const count = useCartStore((state) => cartCount(state.items));
  const openCart = useCartStore((state) => state.openCart);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Ver carrito"
      className="relative text-foreground/70 transition-colors duration-200 hover:text-foreground"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        // key={count}: vuelve a montar el globito en cada cambio de
        // cantidad, así el "pop" de entrada se repite cada vez en vez de
        // solo la primera vez que aparece.
        <span
          key={count}
          className="absolute -right-2 -top-2 flex size-4 animate-in zoom-in-50 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground duration-300"
        >
          {count}
        </span>
      )}
    </button>
  );
}
