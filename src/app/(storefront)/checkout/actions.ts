"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOrCreateGuestUser } from "@/lib/auth";
import { checkoutSchema, type ShippingInfo } from "@/lib/validations/checkout";
import { createCheckoutPreference } from "@/lib/payments/mercadopago";

export type CreateOrderResult = { error: string } | { url: string };

type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  shippingInfo: ShippingInfo;
  email?: string;
};

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { items, shippingInfo, email } = parsed.data;

  // No hace falta estar logueado para comprar: si no hay sesión, se busca
  // (o se crea) el cliente por el email que dejó en el formulario — mismo
  // mecanismo que un cliente cargado a mano desde /admin/usuarios.
  let user = await getCurrentUser();
  if (!user) {
    if (!email) {
      return { error: "Dejanos tu email para poder avisarte sobre tu pedido." };
    }
    user = await getOrCreateGuestUser(email, shippingInfo.fullName);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  // El precio y el stock SIEMPRE se toman de acá, nunca de lo que mandó el
  // navegador — el carrito del cliente solo aporta productId + cantidad.
  const orderLines: { productId: string; name: string; price: number; quantity: number; isUsed: boolean }[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: "Uno de los productos ya no existe." };

    if (product.isUsed) {
      if (product.status !== "AVAILABLE") {
        return { error: `"${product.name}" ya no está disponible.` };
      }
      if (item.quantity > 1) {
        return { error: `"${product.name}" es una unidad única, no se puede pedir más de 1.` };
      }
    } else if ((product.quantity ?? 0) < item.quantity) {
      return { error: `No hay stock suficiente de "${product.name}".` };
    }

    orderLines.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: item.quantity,
      isUsed: product.isUsed,
    });
  }

  const total = orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        total,
        status: "pending",
        shippingInfo,
        items: {
          create: orderLines.map((line) => ({
            productId: line.productId,
            price: line.price,
            quantity: line.quantity,
          })),
        },
      },
    });

    // Reserva las unidades únicas (usados) para que nadie más las compre
    // mientras este pago está en curso. Los sellados no se tocan acá —
    // tienen stock real y se descuenta recién cuando el webhook confirma
    // el pago, para no bloquear stock por checkouts que nunca se terminan.
    const usedIds = orderLines.filter((l) => l.isUsed).map((l) => l.productId);
    if (usedIds.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: usedIds } },
        data: { status: "RESERVED", reservedAt: new Date() },
      });
    }

    return created;
  });

  try {
    const url = await createCheckoutPreference({
      id: order.id,
      items: orderLines.map((line) => ({
        id: line.productId,
        title: line.name,
        quantity: line.quantity,
        unitPrice: line.price,
      })),
      payerEmail: user.email,
    });
    return { url };
  } catch (error) {
    // No se pudo armar el link de pago (típicamente: Mercado Pago todavía
    // no está configurado). Se deshace todo — el pedido y la reserva de
    // stock — para no dejar productos trabados sin ninguna forma de pagar.
    await prisma.$transaction(async (tx) => {
      const usedIds = orderLines.filter((l) => l.isUsed).map((l) => l.productId);
      if (usedIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: usedIds } },
          data: { status: "AVAILABLE", reservedAt: null },
        });
      }
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.order.delete({ where: { id: order.id } });
    });

    return {
      error:
        error instanceof Error ? error.message : "No se pudo iniciar el pago con Mercado Pago.",
    };
  }
}
