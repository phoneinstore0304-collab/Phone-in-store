"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { logAdminAction } from "@/lib/audit-log";

// Valores tal como vienen del formulario (todo string, para poder
// reponerlos en los <input> si algo falla). `isUsed` es la excepción
// porque el checkbox no tiene un valor de texto útil.
type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  isUsed: boolean;
  condition: string;
  quantity: string;
};

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof Omit<ProductFormValues, "isUsed">, string>>;
  values?: ProductFormValues;
};

function readRawValues(formData: FormData): ProductFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    isUsed: formData.get("isUsed") === "on",
    condition: String(formData.get("condition") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
  };
}

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

// Arma el estado que vuelve al formulario cuando la validación falla: un
// mensaje por cada campo con error, y los valores tipeados con los campos
// inválidos vacíos (los válidos se mantienen tal cual los escribió el admin).
function invalidFormState(error: z.ZodError, formData: FormData): ProductFormState {
  const fieldErrors: NonNullable<ProductFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issue.message;
    }
  }

  const values = readRawValues(formData);
  for (const field of Object.keys(fieldErrors)) {
    if (field !== "isUsed") {
      values[field as keyof Omit<ProductFormValues, "isUsed">] = "";
    }
  }

  return { fieldErrors, values };
}

// Las fotos ya se subieron a Supabase Storage directo desde el navegador
// (ver ImagePicker en product-form.tsx — Vercel corta cualquier request de
// más de 4.5MB, así que el archivo nunca viaja hasta acá). Estos campos
// solo traen las URLs: "keepImages" son las que el admin no sacó, "newImages"
// las recién subidas. El array final de `images` es la unión de las dos.
function readImageUrls(formData: FormData, field: "keepImages" | "newImages") {
  return formData.getAll(field).map(String).filter(Boolean);
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  const { isUsed, condition, quantity, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      images: [...readImageUrls(formData, "keepImages"), ...readImageUrls(formData, "newImages")],
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
    return invalidFormState(parsed.error, formData);
  }

  const { isUsed, condition, quantity, ...rest } = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      images: [...readImageUrls(formData, "keepImages"), ...readImageUrls(formData, "newImages")],
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
