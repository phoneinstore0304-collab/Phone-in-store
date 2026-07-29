"use server";

import type { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category";
import { logAdminAction } from "@/lib/audit-log";

type CategoryFormValues = {
  name: string;
  slug: string;
  order: string;
};

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CategoryFormValues, string>>;
  values?: CategoryFormValues;
};

function readRawValues(formData: FormData): CategoryFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    order: String(formData.get("order") ?? ""),
  };
}

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    order: formData.get("order"),
  });
}

// Mismo patrón que en productos/promociones: solo se vacían los campos que
// fallaron, el resto se mantiene tal como lo cargó el admin.
function invalidFormState(error: z.ZodError, formData: FormData): CategoryFormState {
  const fieldErrors: NonNullable<CategoryFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issue.message;
    }
  }

  const values = readRawValues(formData);
  for (const field of Object.keys(fieldErrors)) {
    values[field as keyof CategoryFormValues] = "";
  }

  return { fieldErrors, values };
}

// El slug es @unique en la base: si ya existe, Prisma tira P2002 en vez de
// dejar romper la página con un error genérico.
function isUniqueSlugViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  let category;
  try {
    category = await prisma.category.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return {
        fieldErrors: { slug: "Ya existe una categoría con ese slug" },
        values: { ...readRawValues(formData), slug: "" },
      };
    }
    throw error;
  }

  await logAdminAction(admin.id, "CREATE", "Category", category.id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requireAdmin();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { error: "Categoría no encontrada" };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return {
        fieldErrors: { slug: "Ya existe una categoría con ese slug" },
        values: { ...readRawValues(formData), slug: "" },
      };
    }
    throw error;
  }

  await logAdminAction(admin.id, "UPDATE", "Category", id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function deleteCategory(id: string) {
  const admin = await requireAdmin();

  // La UI ya oculta "Eliminar" cuando hay productos (ver admin/categorias/page.tsx);
  // esto es el resguardo del lado del servidor por si igual se llega a llamar.
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `No se puede eliminar: hay ${productCount} producto(s) en esta categoría. Movelos o eliminalos primero.`,
    );
  }

  await prisma.category.delete({ where: { id } });
  await logAdminAction(admin.id, "DELETE", "Category", id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
