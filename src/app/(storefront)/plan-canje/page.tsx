import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TradeInForm } from "@/components/trade-in/trade-in-form";

export default async function TradeInPage() {
  const [user, catalog] = await Promise.all([
    getCurrentUser(),
    prisma.tradeInModelPrice.findMany({ orderBy: [{ model: "asc" }, { storageGb: "asc" }] }),
  ]);

  return (
    <div className="flex flex-1 flex-col px-6 py-10 sm:px-10">
      <TradeInForm
        initialName={user?.name ?? ""}
        initialEmail={user?.email ?? ""}
        catalog={catalog.map((entry) => ({ model: entry.model, storageGb: entry.storageGb }))}
        header={
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
              Plan Canje
            </h1>
            <p className="text-sm text-zinc-500">
              Dejá tu celular actual como parte de pago. Contestá estas preguntas y te mostramos
              una cotización estimada al instante.
            </p>
          </div>
        }
      />
    </div>
  );
}
