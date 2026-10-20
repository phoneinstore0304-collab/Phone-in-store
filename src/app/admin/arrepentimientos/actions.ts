"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-log";

const validStatuses = ["pending", "resolved"] as const;

export async function updateWithdrawalStatus(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
    throw new Error("Estado inválido");
  }

  await prisma.withdrawalRequest.update({ where: { id }, data: { status } });
  await logAdminAction(admin.id, "UPDATE", "WithdrawalRequest", id);
  revalidatePath("/admin/arrepentimientos");
  revalidatePath(`/admin/arrepentimientos/${id}`);
}
