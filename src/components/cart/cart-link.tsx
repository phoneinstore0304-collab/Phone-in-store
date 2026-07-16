"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, cartCount } from "@/lib/store/cart-store";

export function CartLink() {
  const count = useCartStore((state) => cartCount(state.items));

  return (
    <Link href="/carrito" className="relative text-zinc-600 hover:text-zinc-900">
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
          {count}
        </span>
      )}
      <span className="sr-only">Carrito</span>
    </Link>
  );
}
