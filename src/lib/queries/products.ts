import { prisma } from "@/lib/prisma";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getFeaturedProductsByCategory(categoryId: string, take = 4) {
  return prisma.product.findMany({
    where: { categoryId, status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
};

export function getProductsByCategory(
  categoryId: string,
  filters: ProductFilters = {},
) {
  return prisma.product.findMany({
    where: {
      categoryId,
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            price: {
              ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.condition ? { condition: filters.condition } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}
