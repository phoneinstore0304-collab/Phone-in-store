"use client";

import { useState } from "react";
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
      {justAdded ? "Agregado" : "Agregar al carrito"}
    </Button>
  );
}
