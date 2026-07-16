"use client";

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

export function PromotionForm({
  action,
  promotion,
}: {
  action: (prevState: PromotionFormState, formData: FormData) => Promise<PromotionFormState>;
  promotion?: Promotion;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={promotion?.title} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link">Link (a dónde lleva al hacer click)</Label>
        <Input
          id="link"
          name="link"
          defaultValue={promotion?.link ?? undefined}
          placeholder="/categoria/iphone-usados"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order">Orden (menor número aparece primero)</Label>
        <Input id="order" name="order" type="number" min={0} defaultValue={promotion?.order ?? 0} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeFrom">Activa desde</Label>
          <Input
            id="activeFrom"
            name="activeFrom"
            type="datetime-local"
            defaultValue={promotion ? toDatetimeLocal(promotion.activeFrom) : undefined}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeTo">Activa hasta</Label>
          <Input
            id="activeTo"
            name="activeTo"
            type="datetime-local"
            defaultValue={promotion ? toDatetimeLocal(promotion.activeTo) : undefined}
            required
          />
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
