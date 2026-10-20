import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

const statusLabel: Record<string, { label: string; variant: "secondary" | "default" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  resolved: { label: "Resuelto", variant: "default" },
};

export default async function AdminWithdrawalsPage() {
  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Arrepentimientos</h1>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Código de operación</th>
              <th className="px-4 py-3 font-medium">Producto/servicio</th>
              <th className="px-4 py-3 font-medium">Monto</th>
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
                  <td className="px-4 py-3">{request.orderCode}</td>
                  <td className="px-4 py-3">{request.productOrService}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {formatPrice(request.amount.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/arrepentimientos/${request.id}`}
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
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay pedidos de arrepentimiento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
