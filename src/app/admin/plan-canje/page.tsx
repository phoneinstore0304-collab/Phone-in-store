import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const statusLabel: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  contacted: { label: "Contactado", variant: "default" },
  closed: { label: "Cerrado", variant: "outline" },
};

export default async function AdminTradeInPage() {
  const requests = await prisma.tradeInRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Plan Canje</h1>
        <Link href="/admin/plan-canje/precios" className={buttonVariants({ variant: "outline" })}>
          Precios del cotizador
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Almacenamiento</th>
              <th className="px-4 py-3 font-medium">Batería</th>
              <th className="px-4 py-3 font-medium">Cotización</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const status = statusLabel[request.status] ?? statusLabel.pending;
              return (
                <tr key={request.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 text-zinc-500">
                    {request.createdAt.toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3">{request.fullName ?? "Sin nombre"}</td>
                  <td className="px-4 py-3">{request.model}</td>
                  <td className="px-4 py-3 text-zinc-500">{request.storageGb} GB</td>
                  <td className="px-4 py-3 text-zinc-500">{request.batteryHealth}%</td>
                  <td className="px-4 py-3">
                    {request.needsInPersonReview ? (
                      <span className="text-amber-600">Revisión en persona</span>
                    ) : request.quotedPriceUsd !== null ? (
                      <span className="font-medium text-zinc-900">
                        USD {request.quotedPriceUsd}
                      </span>
                    ) : (
                      <span className="text-zinc-400">Sin precio de referencia</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/plan-canje/${request.id}`}
                      className="text-sm text-zinc-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay pedidos de cotización.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
