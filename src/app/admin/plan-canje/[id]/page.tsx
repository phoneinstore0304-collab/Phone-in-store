import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { updateTradeInStatus, deleteTradeInRequest } from "../actions";

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

function yesNo(value: boolean) {
  return value ? "Sí" : "No";
}

export default async function AdminTradeInDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.tradeInRequest.findUnique({ where: { id } });
  if (!request) notFound();

  const cosmeticDetails = [
    request.hasFrameDetail && "Marco",
    request.hasBackDetail && "Tapa trasera",
    request.hasCameraSmudge && "Cámara (manchas)",
    request.hasScreenScratch && "Pantalla (rayón leve)",
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {request.fullName ?? "Sin nombre"} — {request.model}
        </h1>
        <DeleteButton action={deleteTradeInRequest.bind(null, request.id)} />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5">
        <span className="text-xs text-zinc-400">Cotización</span>
        {request.needsInPersonReview ? (
          <span className="text-lg font-semibold text-amber-600">
            Requiere revisión técnica en persona
          </span>
        ) : request.quotedPriceUsd !== null ? (
          <span className="text-lg font-semibold text-zinc-900">
            USD {request.quotedPriceUsd}
          </span>
        ) : (
          <span className="text-lg font-semibold text-zinc-400">
            Sin precio de referencia cargado para este modelo
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Fecha" value={request.createdAt.toLocaleString("es-AR")} />
          <Field label="Teléfono" value={request.phone ?? "-"} />
          <Field label="Email" value={request.email ?? "-"} />
          <Field
            label="Términos aceptados"
            value={request.acceptedTermsAt.toLocaleString("es-AR")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Modelo" value={request.model} />
          <Field label="Almacenamiento" value={`${request.storageGb} GB`} />
          <Field label="Batería" value={`${request.batteryHealth}%`} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="¿Caja original?" value={yesNo(request.hasOriginalBox)} />
          <Field label="¿Garantía vigente?" value={yesNo(request.hasWarranty)} />
          <Field label="¿Comprado nuevo?" value={yesNo(request.boughtNew)} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400">Detalles estéticos</span>
            <span className="text-sm text-zinc-800">
              {cosmeticDetails.length > 0 ? cosmeticDetails.join(", ") : "Ninguno"}
              {request.cosmeticNotes ? ` — ${request.cosmeticNotes}` : ""}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400">¿Tuvo reparaciones o cambio de componente?</span>
            <span className="text-sm text-zinc-800">
              {yesNo(request.hasRepairs)}
              {request.repairsDetail ? ` — ${request.repairsDetail}` : ""}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400">¿Alguna rotura (vidrio, pantalla, etc.)?</span>
            <span className="text-sm text-zinc-800">
              {yesNo(request.hasBreakage)}
              {request.breakageDetail ? ` — ${request.breakageDetail}` : ""}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400">
              ¿Algún componente no funciona o funciona mal?
            </span>
            <span className="text-sm text-zinc-800">
              {yesNo(request.hasFunctionalIssues)}
              {request.functionalIssuesDetail ? ` — ${request.functionalIssuesDetail}` : ""}
            </span>
          </div>
          {request.notes && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-zinc-400">Notas</span>
              <span className="text-sm text-zinc-800">{request.notes}</span>
            </div>
          )}
        </div>
      </div>

      <form
        action={updateTradeInStatus.bind(null, request.id)}
        className="flex items-center gap-3"
      >
        <select name="status" defaultValue={request.status} className={selectClassName}>
          <option value="pending">Pendiente</option>
          <option value="contacted">Contactado</option>
          <option value="closed">Cerrado</option>
        </select>
        <Button type="submit" size="sm">
          Actualizar estado
        </Button>
      </form>
    </div>
  );
}
