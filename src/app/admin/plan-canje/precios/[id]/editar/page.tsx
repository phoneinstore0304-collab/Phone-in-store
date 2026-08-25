import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TradeInPriceForm } from "@/components/admin/trade-in-price-form";
import { updateTradeInPrice } from "../../actions";

export default async function EditTradeInPricePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const price = await prisma.tradeInModelPrice.findUnique({ where: { id } });
  if (!price) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Editar precio</h1>
      <TradeInPriceForm action={updateTradeInPrice.bind(null, id)} price={price} />
    </div>
  );
}
