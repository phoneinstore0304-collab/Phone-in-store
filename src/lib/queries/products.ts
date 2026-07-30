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

// Otros colores del mismo producto (mismo variantGroupId), sin incluirse a
// sí mismo — para los botones de color en la ficha de producto. Si el
// producto no tiene grupo, no hay nada que buscar.
export function getVariantSiblings(product: { id: string; variantGroupId: string | null }) {
  if (!product.variantGroupId) return Promise.resolve([]);
  return prisma.product.findMany({
    where: { variantGroupId: product.variantGroupId, id: { not: product.id } },
    select: { id: true, name: true, slug: true, color: true, colorHex: true, images: true },
    orderBy: { createdAt: "asc" },
  });
}
