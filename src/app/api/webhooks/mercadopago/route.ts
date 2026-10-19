import { NextResponse, type NextRequest } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/payments/mercadopago";
import { sendOrderPaidEmail } from "@/lib/email";

// Confirma pagos de Mercado Pago y actualiza el pedido correspondiente.
// Nunca hay que confiar en el body de la notificación tal cual llega (lo
// podría mandar cualquiera): primero se valida la firma, y después se
// vuelve a pedir el pago real a la API de MP con el id que vino, para
// tener el estado autoritativo.
export async function POST(request: NextRequest) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MP_WEBHOOK_SECRET no configurado — se rechaza el webhook.");
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }

  const dataId = request.nextUrl.searchParams.get("data.id");
  const type = request.nextUrl.searchParams.get("type");

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 300,
    });
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  // Solo interesan las notificaciones de pago — MP también manda otros
  // tipos (merchant_order, point_integration_wh, etc.) a la misma URL.
  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  const payment = await getPayment(dataId);
  const orderId = payment.external_reference;
  if (!orderId) return NextResponse.json({ received: true });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });
  if (!order) return NextResponse.json({ received: true });

  // MP reintenta notificaciones — si ya procesamos este pedido, no hay
  // nada más que hacer (evita descontar stock dos veces).
  if (order.status !== "pending") return NextResponse.json({ received: true });

  if (payment.status === "approved") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "paid", mpPaymentId: String(payment.id) },
      });

      for (const item of order.items) {
        if (item.product.isUsed) {
          await tx.product.update({ where: { id: item.productId }, data: { status: "SOLD" } });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
    });

    // El comprobante es un "nice to have", no algo de lo que dependa
    // confirmar el pedido — si falla el envío (ej: credenciales de Gmail
    // mal cargadas), no hay que romper la respuesta al webhook por eso
    // (Mercado Pago reintentaría de nuevo sin necesidad).
    try {
      await sendOrderPaidEmail({
        id: order.id,
        to: order.user.email,
        items: order.items.map((item) => ({
          name: item.product.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
        total: Number(order.total),
      });
    } catch (error) {
      console.error("No se pudo mandar el email de comprobante:", error);
    }
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelled", mpPaymentId: String(payment.id) },
      });

      // Libera las unidades únicas que se habían reservado al iniciar el
      // checkout — los sellados no se tocaron en ese momento, así que acá
      // tampoco hay nada que revertirles.
      const usedIds = order.items.filter((item) => item.product.isUsed).map((item) => item.productId);
      if (usedIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: usedIds } },
          data: { status: "AVAILABLE", reservedAt: null },
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}
