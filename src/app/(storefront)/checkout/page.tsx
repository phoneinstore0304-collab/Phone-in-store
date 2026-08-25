import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  await requireUser();

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
        Finalizar compra
      </h1>
      <CheckoutForm />
    </div>
  );
}
