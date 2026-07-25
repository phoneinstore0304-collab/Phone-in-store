"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";

export function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string | undefined;
    isUsed: boolean;
    quantity: number | null;
  };
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      // Unidad única (usado) => no se puede sumar más de 1 al carrito.
      maxQuantity: product.isUsed ? 1 : product.quantity ?? 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Button size="lg" className="w-full sm:w-auto" onClick={handleClick}>
      {/* key: fuerza a remontar cada vez que cambia el texto, para que la
      animación de entrada se vea de nuevo en cada click (no solo la
      primera vez que aparece "Agregado"). */}
      <span
        key={justAdded ? "added" : "idle"}
        className="inline-flex animate-in items-center gap-1.5 fade-in zoom-in-95 duration-200"
      >
        {justAdded && <Check className="size-4" />}
        {justAdded ? "Agregado" : "Agregar al carrito"}
      </span>
    </Button>
  );
}
