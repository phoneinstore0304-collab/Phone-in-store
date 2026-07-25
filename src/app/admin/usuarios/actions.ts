"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { userSchema, pointsAdjustSchema } from "@/lib/validations/user";
import { logAdminAction } from "@/lib/audit-log";

type UserFormValues = { name: string; email: string };

export type UserFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof UserFormValues, string>>;
  values?: UserFormValues;
};

function readRawValues(formData: FormData): UserFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
}

function invalidFormState(error: z.ZodError, formData: FormData): UserFormState {
  const fieldErrors: NonNullable<UserFormState["fieldErrors"]> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = issue.message;
    }
  }

  const values = readRawValues(formData);
  for (const field of Object.keys(fieldErrors)) {
    values[field as keyof UserFormValues] = "";
  }

  return { fieldErrors, values };
}

// Cliente cargado a mano (brief punto 10: carga manual de
// clientes/afinidad). Queda sin `clerkId` — todavía no tiene cuenta. Si
// después se registra de verdad con el mismo email, getCurrentUser() (ver
// src/lib/auth.ts) reclama esta fila en vez de duplicarla.
export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const parsed = userSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return invalidFormState(parsed.error, formData);
  }

  let user;
  try {
    user = await prisma.user.create({
      data: { email: parsed.data.email, name: parsed.data.name || null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        fieldErrors: { email: "Ya hay un usuario con ese email" },
        values: readRawValues(formData),
      };
    }
    throw error;
  }

  await logAdminAction(admin.id, "CREATE", "User", user.id);
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export type PointsFormState = { error?: string };

// Ajuste manual de puntos (positivo suma, negativo resta). Queda registrado
// en PointsTransaction para tener un historial — lo mismo que va a usar
// más adelante el alta/baja automática de puntos por compra.
export async function adjustPoints(
  userId: string,
  _prevState: PointsFormState,
  formData: FormData,
): Promise<PointsFormState> {
  const admin = await requireAdmin();

  const parsed = pointsAdjustSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Cantidad inválida" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado" };

  const { amount } = parsed.data;
  if (user.points + amount < 0) {
    return { error: `No se pueden descontar ${Math.abs(amount)} puntos: solo tiene ${user.points}.` };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    }),
    prisma.pointsTransaction.create({
      data: { userId, amount, type: "MANUAL" },
    }),
  ]);

  await logAdminAction(admin.id, "ADJUST_POINTS", "User", userId);
  revalidatePath("/admin/usuarios");
  return {};
}
