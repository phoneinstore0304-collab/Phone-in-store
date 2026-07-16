"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { productSchema } from "@/lib/validations/product";
import { logAdminAction } from "@/lib/audit-log";

export type ProductFormState = { error?: string };

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    isUsed: formData.get("isUsed") === "on",
    condition: formData.get("condition") || undefined,
    quantity: formData.get("quantity") || undefined,
  });
}

async function uploadIfProvided(formData: FormData) {
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    return uploadImage(imageFile, "products");
  }
  return undefined;
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  let image: string | undefined;
  try {
    image = await uploadIfProvided(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen" };
  }

  const { isUsed, condition, quantity, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      images: image ? [image] : [],
      isUsed,
      condition: isUsed ? condition : null,
      quantity: isUsed ? null : quantity,
    },
  });

  await logAdminAction(admin.id, "CREATE", "Product", product.id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Producto no encontrado" };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  let image: string | undefined;
  try {
    image = await uploadIfProvided(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen" };
  }

  const { isUsed, condition, quantity, ...rest } = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      images: image ? [image] : existing.images,
      isUsed,
      condition: isUsed ? condition : null,
      quantity: isUsed ? null : quantity,
    },
  });

  await logAdminAction(admin.id, "UPDATE", "Product", id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(id: string) {
  const admin = await requireAdmin();
  await prisma.product.delete({ where: { id } });
  await logAdminAction(admin.id, "DELETE", "Product", id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
