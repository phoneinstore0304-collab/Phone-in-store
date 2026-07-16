"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { promotionSchema } from "@/lib/validations/promotion";
import { logAdminAction } from "@/lib/audit-log";

export type PromotionFormState = { error?: string };

function parsePromotionForm(formData: FormData) {
  return promotionSchema.safeParse({
    title: formData.get("title"),
    link: formData.get("link") || undefined,
    order: formData.get("order"),
    activeFrom: formData.get("activeFrom"),
    activeTo: formData.get("activeTo"),
  });
}

export async function createPromotion(
  _prevState: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const admin = await requireAdmin();

  const parsed = parsePromotionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "La imagen es obligatoria" };
  }

  let image: string;
  try {
    image = await uploadImage(imageFile, "promotions");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen" };
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
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const imageFile = formData.get("image");
  let image = existing.image;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      image = await uploadImage(imageFile, "promotions");
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo subir la imagen" };
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
