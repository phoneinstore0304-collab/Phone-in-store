import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Autocompletado del buscador de productos del panel admin. Devuelve pocos
// resultados y solo los campos que necesita la vista previa (nada de
// descripción/stock) porque se llama en cada tecleo.
export async function GET(request: NextRequest) {
  await requireAdmin();

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length === 0) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    select: { id: true, name: true, slug: true, price: true, images: true },
    orderBy: { name: "asc" },
    take: 8,
  });

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      price: product.price.toString(),
    })),
  });
}
