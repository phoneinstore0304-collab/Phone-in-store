import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { updateWithdrawalStatus } from "../actions";

const selectClassName =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-800">{value}</span>
    </div>
  );
}

export default async function AdminWithdrawalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!request) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Arrepentimiento — {request.orderCode}
      </h1>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-3">
        <Field label="Fecha de solicitud" value={request.createdAt.toLocaleString("es-AR")} />
        <Field label="Fecha de compra" value={request.purchaseDate.toLocaleDateString("es-AR")} />
        <Field label="Código de operación" value={request.orderCode} />
        <Field label="Producto o servicio" value={request.productOrService} />
        <Field label="Monto" value={formatPrice(request.amount.toString())} />
        <Field
          label="Documento"
          value={`${request.documentType} ${request.documentNumber}`}
        />
        <Field label="Email de contacto" value={request.contactEmail} />
        <Field label="Teléfono" value={request.contactPhone ?? "-"} />
        {request.reason && <Field label="Motivo" value={request.reason} />}
      </div>

      <form
        action={updateWithdrawalStatus.bind(null, request.id)}
        className="flex items-center gap-3"
      >
        <select name="status" defaultValue={request.status} className={selectClassName}>
          <option value="pending">Pendiente</option>
          <option value="resolved">Resuelto</option>
        </select>
        <Button type="submit" size="sm">
          Actualizar estado
        </Button>
      </form>
    </div>
  );
}
