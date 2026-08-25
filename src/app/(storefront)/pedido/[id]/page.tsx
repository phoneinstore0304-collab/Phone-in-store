import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Clock, CircleX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

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
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  // No dejamos ver pedidos ajenos solo porque alguien adivine/edite el id
  // en la URL de vuelta de Mercado Pago.
  if (!order || order.userId !== user.id) notFound();

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

      <Link href="/" className={buttonVariants()}>
        Volver a la tienda
      </Link>
    </div>
  );
}
