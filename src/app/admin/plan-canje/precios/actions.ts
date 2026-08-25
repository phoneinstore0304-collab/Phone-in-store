"use server";

import type { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tradeInPriceSchema } from "@/lib/validations/trade-in-price";
import { logAdminAction } from "@/lib/audit-log";

type PriceFormValues = {
  model: string;
  storageGb: string;
  basePriceUsd: string;
};

export type PriceFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PriceFormValues, string>>;
  values?: PriceFormValues;
};

function readRawValues(formData: FormData): PriceFormValues {
  return {
    model: String(formData.get("model") ?? ""),
    storageGb: String(formData.get("storageGb") ?? ""),
    basePriceUsd: String(formData.get("basePriceUsd") ?? ""),
  };
}

function parsePriceForm(formData: FormData) {
  return tradeInPriceSchema.safeParse({
    model: formData.get("model"),
    storageGb: formData.get("storageGb"),
    basePriceUsd: formData.get("basePriceUsd"),
  });
}

function invalidFormState(error: z.ZodError, formData: FormData): PriceFormState {
  const fieldErrors: NonNullable<PriceFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issue.message;
    }
  }
  return { fieldErrors, values: readRawValues(formData) };
}

// model+storageGb es @@unique en la base: si ya existe esa combinación,
// Prisma tira P2002 en vez de dejar romper la página con un error genérico.
function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createTradeInPrice(
  _prevState: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const admin = await requireAdmin();

  const parsed = parsePriceForm(formData);
  if (!parsed.success) return invalidFormState(parsed.error, formData);

  let price;
  try {
    price = await prisma.tradeInModelPrice.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: { storageGb: "Ya existe un precio cargado para ese modelo y almacenamiento" },
        values: readRawValues(formData),
      };
    }
    throw error;
  }

  await logAdminAction(admin.id, "CREATE", "TradeInModelPrice", price.id);
  revalidatePath("/admin/plan-canje/precios");
  redirect("/admin/plan-canje/precios");
}

export async function updateTradeInPrice(
  id: string,
  _prevState: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const admin = await requireAdmin();

  const existing = await prisma.tradeInModelPrice.findUnique({ where: { id } });
  if (!existing) return { error: "Precio no encontrado" };

  const parsed = parsePriceForm(formData);
  if (!parsed.success) return invalidFormState(parsed.error, formData);

  try {
    await prisma.tradeInModelPrice.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: { storageGb: "Ya existe un precio cargado para ese modelo y almacenamiento" },
        values: readRawValues(formData),
      };
    }
    throw error;
  }

  await logAdminAction(admin.id, "UPDATE", "TradeInModelPrice", id);
  revalidatePath("/admin/plan-canje/precios");
  redirect("/admin/plan-canje/precios");
}

export async function deleteTradeInPrice(id: string) {
  const admin = await requireAdmin();

  await prisma.tradeInModelPrice.delete({ where: { id } });
  await logAdminAction(admin.id, "DELETE", "TradeInModelPrice", id);
  revalidatePath("/admin/plan-canje/precios");
}
