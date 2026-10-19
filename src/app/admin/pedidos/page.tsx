import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

const statusLabel: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Pedidos</h1>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = statusLabel[order.status] ?? statusLabel.pending;
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <tr key={order.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 text-zinc-500">
                    {order.createdAt.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{order.user.name ?? "Sin nombre"}</span>
                      <span className="text-xs text-zinc-400">{order.user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {itemCount} {itemCount === 1 ? "producto" : "productos"}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {formatPrice(order.total.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-sm text-zinc-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
