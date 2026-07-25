"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PointsFormState } from "@/app/admin/usuarios/actions";

export function PointsAdjustForm({
  action,
}: {
  action: (prevState: PointsFormState, formData: FormData) => Promise<PointsFormState>;
}) {
  const [state, formAction, pending] = useActionState<PointsFormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        // Al ser un ajuste puntual (no un alta con muchos campos), alcanza
        // con limpiar el input después de aplicarlo en vez de rearmar todo
        // el estado del formulario.
        formRef.current?.reset();
      }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-1.5">
        <Input
          name="amount"
          type="number"
          placeholder="+/- puntos"
          aria-invalid={Boolean(state.error)}
          className="h-7 w-24 text-xs"
          required
        />
        <Button type="submit" size="xs" variant="outline" disabled={pending}>
          Aplicar
        </Button>
      </div>
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
