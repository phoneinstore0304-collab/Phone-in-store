"use server";

import { prisma } from "@/lib/prisma";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validations/withdrawal";
import { sendWithdrawalConfirmationEmail, sendWithdrawalNotificationToOwner } from "@/lib/email";

export type WithdrawalResult = { error: string } | { ok: true };

export async function createWithdrawalRequest(input: WithdrawalInput): Promise<WithdrawalResult> {
  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario." };
  }
  const { reason, contactPhone, purchaseDate, ...rest } = parsed.data;

  const request = await prisma.withdrawalRequest.create({
    data: {
      ...rest,
      purchaseDate: new Date(purchaseDate),
      reason: reason || null,
      contactPhone: contactPhone || null,
    },
  });

  // Ninguno de los dos emails es lo que hace válido el pedido — ya quedó
  // guardado en la base — así que un fallo de envío no debe bloquear la
  // respuesta al consumidor.
  try {
    await sendWithdrawalConfirmationEmail({ to: request.contactEmail, id: request.id });
  } catch (error) {
    console.error("No se pudo mandar la confirmación de arrepentimiento:", error);
  }
  try {
    await sendWithdrawalNotificationToOwner({
      id: request.id,
      documentType: request.documentType,
      documentNumber: request.documentNumber,
      orderCode: request.orderCode,
      productOrService: request.productOrService,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone ?? undefined,
    });
  } catch (error) {
    console.error("No se pudo avisar al negocio del arrepentimiento:", error);
  }

  return { ok: true };
}
