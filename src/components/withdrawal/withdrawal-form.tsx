"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createWithdrawalRequest } from "@/app/(storefront)/arrepentimiento/actions";
import type { WithdrawalInput } from "@/lib/validations/withdrawal";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const emptyForm: WithdrawalInput = {
  documentType: "DNI",
  documentNumber: "",
  orderCode: "",
  purchaseDate: "",
  amount: 0,
  productOrService: "",
  reason: "",
  contactEmail: "",
  contactPhone: "",
};

export function WithdrawalForm() {
  const [form, setForm] = useState<WithdrawalInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function updateField<K extends keyof WithdrawalInput>(field: K, value: WithdrawalInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createWithdrawalRequest(form);

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <h2 className="font-display text-xl font-bold text-zinc-900">Listo, lo recibimos</h2>
        <p className="max-w-sm text-sm text-zinc-500">
          Te mandamos un email confirmando que registramos tu pedido. Te vamos a contactar para
          coordinar la devolución.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="documentType">Tipo de documento</Label>
          <select
            id="documentType"
            value={form.documentType}
            onChange={(event) => updateField("documentType", event.target.value)}
            className={selectClassName}
          >
            <option value="DNI">DNI</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="CUIT">CUIT</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="documentNumber">Número de documento</Label>
          <Input
            id="documentNumber"
            value={form.documentNumber}
            onChange={(event) => updateField("documentNumber", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orderCode">Código de la operación (número de pedido)</Label>
        <Input
          id="orderCode"
          value={form.orderCode}
          onChange={(event) => updateField("orderCode", event.target.value)}
          placeholder="Ej: 42"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="purchaseDate">Fecha de compra</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={(event) => updateField("purchaseDate", event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Monto de la operación</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            value={form.amount || ""}
            onChange={(event) => updateField("amount", Number(event.target.value))}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="productOrService">Producto o servicio adquirido</Label>
        <Input
          id="productOrService"
          value={form.productOrService}
          onChange={(event) => updateField("productOrService", event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Motivo (opcional)</Label>
        <textarea
          id="reason"
          value={form.reason}
          onChange={(event) => updateField("reason", event.target.value)}
          rows={3}
          className={textareaClassName}
        />
        <p className="text-xs text-zinc-400">
          No hace falta que indiques un motivo — es tu derecho sin necesidad de justificarlo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Tu email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(event) => updateField("contactEmail", event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactPhone">Teléfono (opcional)</Label>
          <Input
            id="contactPhone"
            value={form.contactPhone}
            onChange={(event) => updateField("contactPhone", event.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-fit">
        {submitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}
