"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/generated/prisma/client";
import type { PromotionFormState } from "@/app/admin/promociones/actions";

// <input type="datetime-local"> necesita "YYYY-MM-DDTHH:mm", no un ISO completo.
function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nowPlusMinutes(minutes: number) {
  return toDatetimeLocal(new Date(Date.now() + minutes * 60_000));
}

export function PromotionForm({
  action,
  promotion,
}: {
  action: (prevState: PromotionFormState, formData: FormData) => Promise<PromotionFormState>;
  promotion?: Promotion;
}) {
  const [state, formAction, pending] = useActionState<PromotionFormState, FormData>(action, {});

  // El navegador limpia el <form> después de cada submit (incluso con
  // error), así que remontamos con `key` cuando llega un `state` nuevo para
  // volver a aplicar `defaultValue` con lo que el admin ya había cargado —
  // los campos inválidos vienen vacíos, el resto se mantiene.
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
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={values?.title ?? promotion?.title}
          aria-invalid={Boolean(fieldErrors.title)}
          required
        />
        {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link">Link (a dónde lleva al hacer click)</Label>
        <Input
          id="link"
          name="link"
          defaultValue={values?.link ?? promotion?.link ?? undefined}
          placeholder="/categoria/iphone-usados"
          aria-invalid={Boolean(fieldErrors.link)}
        />
        {fieldErrors.link && <p className="text-xs text-red-500">{fieldErrors.link}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order">Orden (menor número aparece primero)</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={values?.order ?? promotion?.order ?? 0}
          aria-invalid={Boolean(fieldErrors.order)}
          required
        />
        {fieldErrors.order && <p className="text-xs text-red-500">{fieldErrors.order}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeFrom">Activa desde</Label>
          <Input
            id="activeFrom"
            name="activeFrom"
            type="datetime-local"
            // Si ya se intentó guardar una vez, `values` manda tal cual
            // (incluso vacío si ese campo fue el que falló — no lo pisamos
            // con un default, así el admin ve claro que hay que corregirlo).
            // Si es el primer render de una promoción nueva, arranca en el
            // momento actual para que el admin solo tenga que ajustar.
            defaultValue={
              values ? values.activeFrom : promotion ? toDatetimeLocal(promotion.activeFrom) : nowPlusMinutes(0)
            }
            aria-invalid={Boolean(fieldErrors.activeFrom)}
            required
          />
          {fieldErrors.activeFrom && (
            <p className="text-xs text-red-500">{fieldErrors.activeFrom}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeTo">Activa hasta</Label>
          <Input
            id="activeTo"
            name="activeTo"
            type="datetime-local"
            // Nueva promoción: 30 min después del inicio por defecto, para
            // que ya quede una ventana activa válida y el admin solo la
            // estire si necesita más tiempo.
            defaultValue={
              values ? values.activeTo : promotion ? toDatetimeLocal(promotion.activeTo) : nowPlusMinutes(30)
            }
            aria-invalid={Boolean(fieldErrors.activeTo)}
            required
          />
          {fieldErrors.activeTo && <p className="text-xs text-red-500">{fieldErrors.activeTo}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">
          Imagen {promotion ? "(dejar vacío para mantener la actual)" : ""}
        </Label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : promotion ? "Guardar cambios" : "Crear promoción"}
      </Button>
    </form>
  );
}
