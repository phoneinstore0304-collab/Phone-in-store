"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TradeInModelPrice } from "@/generated/prisma/client";
import type { PriceFormState } from "@/app/admin/plan-canje/precios/actions";

export function TradeInPriceForm({
  action,
  price,
}: {
  action: (prevState: PriceFormState, formData: FormData) => Promise<PriceFormState>;
  price?: TradeInModelPrice;
}) {
  const [state, formAction, pending] = useActionState<PriceFormState, FormData>(action, {});

  // Mismo truco que en category-form: remontamos con `key` para reaplicar
  // `defaultValue` con lo último cargado después de cada submit inválido.
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setFormKey((key) => key + 1);
  }

  const values = state.values;
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="model">Modelo</Label>
        <Input
          id="model"
          name="model"
          defaultValue={values?.model ?? price?.model}
          placeholder="iPhone 16"
          aria-invalid={Boolean(fieldErrors.model)}
          required
        />
        {fieldErrors.model && <p className="text-xs text-red-500">{fieldErrors.model}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="storageGb">Almacenamiento (GB)</Label>
        <Input
          id="storageGb"
          name="storageGb"
          type="number"
          min={1}
          defaultValue={values?.storageGb ?? price?.storageGb}
          aria-invalid={Boolean(fieldErrors.storageGb)}
          required
        />
        {fieldErrors.storageGb && <p className="text-xs text-red-500">{fieldErrors.storageGb}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="basePriceUsd">Precio base (USD)</Label>
        <Input
          id="basePriceUsd"
          name="basePriceUsd"
          type="number"
          min={0}
          defaultValue={values?.basePriceUsd ?? price?.basePriceUsd}
          aria-invalid={Boolean(fieldErrors.basePriceUsd)}
          required
        />
        <p className="text-xs text-zinc-400">
          Precio con batería 89%+ y sin caja — los ajustes (caja, batería, detalles, etc.) se
          calculan solos sobre este valor.
        </p>
        {fieldErrors.basePriceUsd && (
          <p className="text-xs text-red-500">{fieldErrors.basePriceUsd}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : price ? "Guardar cambios" : "Cargar precio"}
      </Button>
    </form>
  );
}
