import { prisma } from "@/lib/prisma";

export function getActivePromotions() {
  const now = new Date();
  return prisma.promotion.findMany({
    where: { activeFrom: { lte: now }, activeTo: { gte: now } },
    orderBy: { order: "asc" },
  });
}
