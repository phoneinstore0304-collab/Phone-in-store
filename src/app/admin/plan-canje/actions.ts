"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";

const validStatuses = ["pending", "contacted", "closed"] as const;

export async function updateTradeInStatus(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    throw new Error("Estado inválido");
  }

  await prisma.tradeInRequest.update({ where: { id }, data: { status } });
  await logAdminAction(admin.id, "UPDATE", "TradeInRequest", id);
  revalidatePath("/admin/plan-canje");
  revalidatePath(`/admin/plan-canje/${id}`);
}

export async function deleteTradeInRequest(id: string) {
  const admin = await requireAdmin();

  await prisma.tradeInRequest.delete({ where: { id } });
  await logAdminAction(admin.id, "DELETE", "TradeInRequest", id);
  revalidatePath("/admin/plan-canje");
}
