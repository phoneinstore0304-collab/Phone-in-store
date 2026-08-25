"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore, cartTotal } from "@/lib/store/cart-store";
import { createOrder } from "@/app/(storefront)/checkout/actions";
import type { ShippingInfo } from "@/lib/validations/checkout";

const emptyShipping: ShippingInfo = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
};

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const [shipping, setShipping] = useState<ShippingInfo>(emptyShipping);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-zinc-500">Tu carrito está vacío.</p>
        <Link href="/" className="text-sm underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  function updateField<K extends keyof ShippingInfo>(field: K, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createOrder({
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      shippingInfo: shipping,
    });

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Mercado Pago es un dominio externo — no un <Link> de Next.
    window.location.href = result.url;
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-zinc-900">Datos de envío</h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Nombre y apellido</Label>
          <Input
            id="fullName"
            value={shipping.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={shipping.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="11 2345-6789"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Dirección (calle, altura, depto)</Label>
          <Input
            id="address"
            value={shipping.address}
            onChange={(event) => updateField("address", event.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={shipping.city}
              onChange={(event) => updateField("city", event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              value={shipping.province}
              onChange={(event) => updateField("province", event.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postalCode">Código postal</Label>
          <Input
            id="postalCode"
            value={shipping.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
            className="max-w-32"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Referencias (opcional)</Label>
          <textarea
            id="notes"
            value={shipping.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-fit">
          {submitting ? "Redirigiendo a Mercado Pago..." : "Ir a pagar"}
        </Button>
      </form>

      <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold text-zinc-900">Tu pedido</h2>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">
                {item.name}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </span>
              <span className="shrink-0 font-medium text-zinc-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(cartTotal(items))}</span>
        </div>
      </aside>
    </div>
  );
}
