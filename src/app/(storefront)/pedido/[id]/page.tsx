import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Clock, CircleX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";

const statusInfo = {
  paid: { icon: CircleCheck, color: "text-emerald-600", label: "¡Pago aprobado!" },
  pending: { icon: Clock, color: "text-amber-600", label: "Pago pendiente" },
  cancelled: { icon: CircleX, color: "text-red-500", label: "Pago rechazado" },
} as const;

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  // Los pedidos de invitado (ver checkout/actions.ts) se pueden ver con
  // solo el link — el id es un cuid no adivinable, y es la única forma que
  // tiene un invitado de consultar su pedido. Importante: esto se decide
  // por order.guestCheckout (grabado en el momento de la compra), NO por
  // si el User tiene clerkId — si alguien compra de invitado con un email
  // que ya tenía cuenta registrada, el pedido se vincula a esa cuenta pero
  // sigue siendo un pedido de invitado, y tiene que poder verlo sin login.
  // Los pedidos hechos con sesión sí exigen estar logueado como ese mismo
  // usuario, para no dejar ver el historial de otra persona si alguien
  // adivina/edita el id en la URL.
  if (!order.guestCheckout && (!user || order.userId !== user.id)) notFound();

  const info = statusInfo[order.status as keyof typeof statusInfo] ?? statusInfo.pending;
  const Icon = info.icon;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-6 px-6 py-16 text-center sm:px-10">
      <Icon className={`size-14 ${info.color}`} />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold text-zinc-900">{info.label}</h1>
        {order.status === "pending" && (
          <p className="text-sm text-zinc-500">
            Si ya pagaste, puede tardar unos segundos en confirmarse acá — actualizá la página.
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left">
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
        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(order.total.toString())}</span>
        </div>
      </div>

      {/* El checkout por ahora solo tiene retiro en el local — ver
      shippingInfoSchema. Cuando se sume envío, acá hay que leer
      shippingInfo.method para mostrar lo que corresponda. */}
      <div className="w-full rounded-2xl border border-border bg-muted/40 p-5 text-left text-sm text-zinc-600">
        <p className="mb-1 font-bold text-zinc-900">Retirás en el local</p>
        <p className="font-medium text-zinc-800">{siteConfig.storeAddress}</p>
        <p>{siteConfig.storeHours}</p>
        {order.status === "paid" && (
          <p className="mt-2 text-emerald-700">
            Ya podés pasar a retirarlo en el horario de atención.
          </p>
        )}
      </div>

      <Link href="/" className={buttonVariants()}>
        Volver a la tienda
      </Link>
    </div>
  );
}
