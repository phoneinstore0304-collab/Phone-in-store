"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";

const STALE_PENDING_MS = 60 * 60 * 1000; // 1 hora

// Los pedidos "pending" son checkouts que nunca se terminaron de pagar (el
// link de Mercado Pago también expira solo a las pocas horas) — no sirven
// para nada pasado un rato, así que se limpian solos. Se llama al entrar a
// /admin/pedidos en vez de necesitar un cron aparte: no hace falta que se
// borren al instante, alcanza con que se limpien la próxima vez que alguien
// mire la lista.
export async function cleanupStalePendingOrders() {
  const cutoff = new Date(Date.now() - STALE_PENDING_MS);
  const stale = await prisma.order.findMany({
    where: { status: "pending", createdAt: { lt: cutoff } },
    include: { items: { include: { product: true } } },
  });
  if (stale.length === 0) return;

  const staleIds = stale.map((order) => order.id);
  // Los usados quedaron reservados al iniciar ese checkout — hay que
  // devolverlos a disponibles. Los sellados nunca se tocaron en pending,
  // así que no hay nada que revertirles.
  const usedProductIds = stale
    .flatMap((order) => order.items)
    .filter((item) => item.product.isUsed)
    .map((item) => item.productId);

  await prisma.$transaction(async (tx) => {
    if (usedProductIds.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: usedProductIds } },
        data: { status: "AVAILABLE", reservedAt: null },
      });
    }
    await tx.orderItem.deleteMany({ where: { orderId: { in: staleIds } } });
    await tx.order.deleteMany({ where: { id: { in: staleIds } } });
  });
}

const validFulfillmentStatuses = ["pending", "shipped", "delivered"] as const;

export async function updateFulfillmentStatus(orderId: string, status: string) {
  const admin = await requireAdmin();
  if (!validFulfillmentStatuses.includes(status as (typeof validFulfillmentStatuses)[number])) {
    throw new Error("Estado inválido");
  }

  await prisma.order.update({ where: { id: orderId }, data: { fulfillmentStatus: status } });
  await logAdminAction(admin.id, "UPDATE", "Order", orderId);
  revalidatePath("/admin/pedidos");
}

export async function deleteOrder(orderId: string) {
  const admin = await requireAdmin();

  // Borrar el pedido no revierte el stock del producto a propósito: si ya
  // estaba pagado y vendido/descontado, eso lo maneja el admin a mano
  // (por ejemplo desde /admin/productos) si hace falta — no asumimos que
  // "borrar el registro" siempre significa "deshacer la venta".
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId } });
    await tx.order.delete({ where: { id: orderId } });
  });

  await logAdminAction(admin.id, "DELETE", "Order", orderId);
  revalidatePath("/admin/pedidos");
}
