import type { Product } from "@/generated/prisma/client";

const colors = {
  ok: "text-emerald-600",
  low: "text-amber-600",
  out: "text-zinc-400",
};

// Usados (unidad única): el "stock" es el status. Sellados (stock real):
// el "stock" es quantity. Mismo código de colores para los dos casos.
export function StockLine({
  product,
}: {
  product: Pick<Product, "isUsed" | "status" | "quantity">;
}) {
  let text: string;
  let color: string;

  if (product.isUsed) {
    if (product.status === "SOLD") {
      text = "Vendido";
      color = colors.out;
    } else if (product.status === "RESERVED") {
      text = "Reservado";
      color = colors.low;
    } else {
      text = "Disponible";
      color = colors.ok;
    }
  } else {
    const stock = product.quantity ?? 0;
    if (stock === 0) {
      text = "Sin stock";
      color = colors.out;
    } else if (stock <= 3) {
      text = `Últimas ${stock} unidades`;
      color = colors.low;
    } else {
      text = `En stock (${stock})`;
      color = colors.ok;
    }
  }

  return <span className={`text-[10.5px] font-semibold ${color}`}>{text}</span>;
}
