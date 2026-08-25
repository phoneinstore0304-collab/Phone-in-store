import { TradeInPriceForm } from "@/components/admin/trade-in-price-form";
import { createTradeInPrice } from "../actions";

export default function NewTradeInPricePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Nuevo precio</h1>
      <TradeInPriceForm action={createTradeInPrice} />
    </div>
  );
}
