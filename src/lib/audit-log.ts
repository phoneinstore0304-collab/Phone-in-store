import { prisma } from "@/lib/prisma";

export function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
) {
  return prisma.adminAuditLog.create({
    data: { adminId, action, targetType, targetId },
  });
}
