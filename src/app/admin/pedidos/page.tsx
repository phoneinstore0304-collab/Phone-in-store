import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { DeleteButton } from "@/components/admin/delete-button";
import { cleanupStalePendingOrders, updateFulfillmentStatus, deleteOrder } from "./actions";

const columns = [
  { status: "pending", title: "Pagado", prev: null, next: "shipped" },
  { status: "shipped", title: "Enviado", prev: "pending", next: "delivered" },
  { status: "delivered", title: "Entregado", prev: "shipped", next: null },
] as const;

export default async function AdminOrdersPage() {
  // Limpia pedidos "pending" (nunca se terminaron de pagar) de más de 1
  // hora cada vez que se entra a esta página — ver actions.ts.
  await cleanupStalePendingOrders();

  const [paidOrders, pendingCount, cancelledCount] = await Promise.all([
    prisma.order.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Pedidos</h1>
        <p className="text-xs text-zinc-400">
          {pendingCount} pendientes de pago (se limpian solos pasada 1 hora) · {cancelledCount}{" "}
          cancelados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => {
          const ordersInColumn = paidOrders.filter(
            (order) => order.fulfillmentStatus === column.status,
          );
          return (
            <div key={column.status} className="flex flex-col gap-3 rounded-xl bg-zinc-100 p-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-zinc-700">{column.title}</h2>
                <span className="text-xs text-zinc-400">{ordersInColumn.length}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {ordersInColumn.map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="font-semibold text-zinc-900 hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                        <DeleteButton action={deleteOrder.bind(null, order.id)} />
                      </div>
                      <span className="text-sm text-zinc-700">
                        {order.user.name ?? order.user.email}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {itemCount} {itemCount === 1 ? "producto" : "productos"} ·{" "}
                        {formatPrice(order.total.toString())}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {order.createdAt.toLocaleDateString("es-AR")}
                      </span>

                      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
                        {column.prev ? (
                          <form action={updateFulfillmentStatus.bind(null, order.id, column.prev)}>
                            <button type="submit" className="text-xs text-zinc-500 hover:underline">
                              ← Atrás
                            </button>
                          </form>
                        ) : (
                          <span />
                        )}
                        {column.next && (
                          <form action={updateFulfillmentStatus.bind(null, order.id, column.next)}>
                            <button type="submit" className="text-xs font-medium text-primary hover:underline">
                              Siguiente →
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
                {ordersInColumn.length === 0 && (
                  <p className="px-1 text-xs text-zinc-400">Nada acá.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
