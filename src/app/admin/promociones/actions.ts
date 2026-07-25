"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { promotionSchema } from "@/lib/validations/promotion";
import { logAdminAction } from "@/lib/audit-log";

// Valores tal como vienen del formulario (todo string), para poder
// reponerlos en los <input> si algo falla.
type PromotionFormValues = {
  title: string;
  link: string;
  order: string;
  activeFrom: string;
  activeTo: string;
};

export type PromotionFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PromotionFormValues, string>>;
  values?: PromotionFormValues;
};

function readRawValues(formData: FormData): PromotionFormValues {
  return {
    title: String(formData.get("title") ?? ""),
    link: String(formData.get("link") ?? ""),
    order: String(formData.get("order") ?? ""),
    activeFrom: String(formData.get("activeFrom") ?? ""),
    activeTo: String(formData.get("activeTo") ?? ""),
  };
}

function parsePromotionForm(formData: FormData) {
  return promotionSchema.safeParse({
    title: formData.get("title"),
    link: formData.get("link") || undefined,
    order: formData.get("order"),
    activeFrom: formData.get("activeFrom"),
    activeTo: formData.get("activeTo"),
  });
}

// Arma el estado que vuelve al formulario cuando la validación falla: un
// mensaje por cada campo con error, y los valores tipeados con los campos
// inválidos vacíos (los válidos se mantienen tal cual los cargó el admin).
// El bug que esto soluciona: el navegador limpia el <form> después de cada
// submit (incluso si la acción del servidor devuelve un error), así que sin
// esto las fechas quedaban vacías en el segundo intento y volvían a fallar
// con "fecha inválida" en un loop confuso.
function invalidFormState(error: z.ZodError, formData: FormData): PromotionFormState {
  const fieldErrors: NonNullable<PromotionFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issue.message;
    }
  }

  const values = readRawValues(formData);
  for (const field of Object.keys(fieldErrors)) {
    values[field as keyof PromotionFormValues] = "";
  }

  return { fieldErrors, values };
}

export async function createPromotion(
  _prevState: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const admin = await requireAdmin();

  const parsed = parsePromotionForm(formData);
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "La imagen es obligatoria", values: readRawValues(formData) };
  }

  let image: string;
  try {
    image = await uploadImage(imageFile, "promotions");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo subir la imagen",
      values: readRawValues(formData),
    };
  }

  const promotion = await prisma.promotion.create({ data: { ...parsed.data, image } });

  await logAdminAction(admin.id, "CREATE", "Promotion", promotion.id);
  revalidatePath("/admin/promociones");
  revalidatePath("/");
  redirect("/admin/promociones");
}

export async function updatePromotion(
  id: string,
  _prevState: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const admin = await requireAdmin();

  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) return { error: "Promoción no encontrada" };

  const parsed = parsePromotionForm(formData);
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  const imageFile = formData.get("image");
  let image = existing.image;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      image = await uploadImage(imageFile, "promotions");
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "No se pudo subir la imagen",
        values: readRawValues(formData),
      };
    }
  }

  await prisma.promotion.update({ where: { id }, data: { ...parsed.data, image } });

  await logAdminAction(admin.id, "UPDATE", "Promotion", id);
  revalidatePath("/admin/promociones");
  revalidatePath("/");
  redirect("/admin/promociones");
}

export async function deletePromotion(id: string) {
  const admin = await requireAdmin();
  await prisma.promotion.delete({ where: { id } });
  await logAdminAction(admin.id, "DELETE", "Promotion", id);
  revalidatePath("/admin/promociones");
  revalidatePath("/");
}
