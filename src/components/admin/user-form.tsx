"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UserFormState } from "@/app/admin/usuarios/actions";

export function UserForm({
  action,
}: {
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {});

  // Mismo truco que en los formularios de productos/promociones: el
  // navegador limpia el <form> en cada submit, así que remontamos con
  // `key` para volver a aplicar defaultValue con lo que ya se cargó.
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setFormKey((key) => key + 1);
  }

  const values = state.values;
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form key={formKey} action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre (opcional)</Label>
        <Input id="name" name="name" defaultValue={values?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={values?.email}
          aria-invalid={Boolean(fieldErrors.email)}
          required
        />
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
        <p className="text-xs text-zinc-500">
          Si esta persona ya tiene o después se crea una cuenta con este mismo
          email, va a quedar vinculada automáticamente a este registro (no se
          pierden los puntos).
        </p>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Crear cliente"}
      </Button>
    </form>
  );
}
