import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTradeInPrice } from "./actions";

export default async function AdminTradeInPricesPage() {
  const prices = await prisma.tradeInModelPrice.findMany({
    orderBy: [{ model: "asc" }, { storageGb: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900">Precios de Plan Canje</h1>
          <Link href="/admin/plan-canje" className="text-sm text-zinc-500 hover:underline">
            ← Volver a los pedidos
          </Link>
        </div>
        <Link href="/admin/plan-canje/precios/nuevo" className={buttonVariants()}>
          Nuevo precio
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Almacenamiento</th>
              <th className="px-4 py-3 font-medium">Precio base (USD)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{price.model}</td>
                <td className="px-4 py-3 text-zinc-500">{price.storageGb} GB</td>
                <td className="px-4 py-3 text-zinc-500">USD {price.basePriceUsd}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/plan-canje/precios/${price.id}/editar`}
                      className="text-sm text-zinc-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteButton action={deleteTradeInPrice.bind(null, price.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {prices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Todavía no hay precios cargados — el cotizador no va a poder calcular nada
                  automático hasta que cargues al menos uno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
