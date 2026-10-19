import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatPrice } from "@/lib/format";
import type { ShippingInfo } from "@/lib/validations/checkout";
import { updateFulfillmentStatus, deleteOrder } from "../actions";

const statusLabel: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

const fulfillmentLabel: Record<string, string> = {
  pending: "Pagado (sin gestionar)",
  shipped: "Enviado",
  delivered: "Entregado",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-800">{value}</span>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
  if (!order) notFound();

  const status = statusLabel[order.status] ?? statusLabel.pending;
  // El checkout solo manda method: "pickup" por ahora (ver
  // shippingInfoSchema) — se castea en vez de validar con Zod de nuevo
  // porque esto ya se guardó validado en el momento de la compra.
  const shipping = order.shippingInfo as ShippingInfo | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Pedido #{order.orderNumber} — {order.user.name ?? order.user.email}
        </h1>
        <div className="flex items-center gap-3">
          <Badge variant={status.variant}>{status.label}</Badge>
          <DeleteButton action={deleteOrder.bind(null, order.id)} />
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Fecha" value={order.createdAt.toLocaleString("es-AR")} />
          <Field label="Email" value={order.user.email} />
          <Field label="Teléfono" value={shipping?.phone ?? "-"} />
          <Field label="Nombre (checkout)" value={shipping?.fullName ?? "-"} />
          <Field label="ID de pago (MP)" value={order.mpPaymentId ?? "-"} />
          {shipping?.notes && <Field label="Nota del cliente" value={shipping.notes} />}
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">
                {item.product.name}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </span>
              <span className="shrink-0 font-medium text-zinc-900">
                {formatPrice(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total.toString())}</span>
          </div>
        </div>
      </div>

      {order.status === "paid" && (
        <form
          action={async (formData) => {
            "use server";
            await updateFulfillmentStatus(order.id, String(formData.get("fulfillmentStatus")));
          }}
          className="flex items-center gap-3"
        >
          <select
            name="fulfillmentStatus"
            defaultValue={order.fulfillmentStatus}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {Object.entries(fulfillmentLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            Actualizar estado
          </Button>
        </form>
      )}
    </div>
  );
}
