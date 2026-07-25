"use client";

import { Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

// Recibe campos planos (no el Product de Prisma tal cual) porque `price`
// en el modelo es un Decimal — un objeto de clase, no serializable al
// cruzar de Server a Client Component. Mismo patrón que AddToCartButton.
type QuickAddProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | undefined;
  isUsed: boolean;
  quantity: number | null;
  status: string;
};

// Botón redondo de "+" directo en la tarjeta (como en el mockup), para
// agregar al carrito sin tener que entrar al producto. Va superpuesto sobre
// el link que cubre toda la tarjeta (ver ProductCard) — por eso el
// preventDefault/stopPropagation, para no disparar la navegación.
export function QuickAddButton({ product }: { product: QuickAddProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const unavailable = product.status !== "AVAILABLE";
  const outOfStock = !product.isUsed && (product.quantity ?? 0) <= 0;
  const disabled = unavailable || outOfStock;

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      maxQuantity: product.isUsed ? 1 : (product.quantity ?? 1),
    });
    openCart();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="Agregar al carrito"
      className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80 disabled:bg-zinc-200 disabled:text-zinc-400"
    >
      <Plus className="size-4" />
    </button>
  );
}
