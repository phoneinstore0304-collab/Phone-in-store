"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tradeInSchema, type TradeInInput } from "@/lib/validations/trade-in";
import { calculateTradeInQuote } from "@/lib/trade-in-pricing";

export type TradeInResult =
  | { error: string }
  | { ok: true; needsInPersonReview: boolean; priceUsd: number | null };

export async function createTradeInRequest(input: TradeInInput): Promise<TradeInResult> {
  const parsed = tradeInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario." };
  }

  const {
    fullName,
    phone,
    email,
    repairsDetail,
    breakageDetail,
    functionalIssuesDetail,
    cosmeticNotes,
    notes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- solo se saca de `rest`, no es un campo de Prisma
    acceptedTerms,
    ...rest
  } = parsed.data;

  const catalogEntry = await prisma.tradeInModelPrice.findUnique({
    where: { model_storageGb: { model: rest.model, storageGb: rest.storageGb } },
  });

  const quote = calculateTradeInQuote(rest, catalogEntry?.basePriceUsd ?? null);

  // Opcional: si está logueado, queda vinculado al usuario. No es requisito
  // para pedir la cotización.
  const user = await getCurrentUser();

  await prisma.tradeInRequest.create({
    data: {
      ...rest,
      userId: user?.id,
      fullName: fullName || null,
      phone: phone || null,
      email: email || null,
      repairsDetail: repairsDetail || null,
      breakageDetail: breakageDetail || null,
      functionalIssuesDetail: functionalIssuesDetail || null,
      cosmeticNotes: cosmeticNotes || null,
      notes: notes || null,
      quotedPriceUsd: quote.priceUsd,
      needsInPersonReview: quote.needsInPersonReview,
      acceptedTermsAt: new Date(),
    },
  });

  return { ok: true, needsInPersonReview: quote.needsInPersonReview, priceUsd: quote.priceUsd };
}
