"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category } from "@/generated/prisma/client";
import type { CategoryFormState } from "@/app/admin/categorias/actions";

export function CategoryForm({
  action,
  category,
}: {
  action: (prevState: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  category?: Category;
}) {
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(action, {});

  // Mismo truco que en el resto de los formularios de admin: el navegador
  // limpia el <form> en cada submit, así que remontamos con `key` para
  // reaplicar `defaultValue` con lo último cargado (los campos inválidos
  // vienen vacíos, el resto se mantiene).
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
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={values?.name ?? category?.name}
          aria-invalid={Boolean(fieldErrors.name)}
          required
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={values?.slug ?? category?.slug}
          placeholder="iphone-usados"
          aria-invalid={Boolean(fieldErrors.slug)}
          required
        />
        {fieldErrors.slug && <p className="text-xs text-red-500">{fieldErrors.slug}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order">Orden (menor número aparece primero)</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={values?.order ?? category?.order ?? 0}
          aria-invalid={Boolean(fieldErrors.order)}
          required
        />
        {fieldErrors.order && <p className="text-xs text-red-500">{fieldErrors.order}</p>}
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : category ? "Guardar cambios" : "Crear categoría"}
      </Button>
    </form>
  );
}
