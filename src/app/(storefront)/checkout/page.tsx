import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

// No hace falta estar logueado para comprar — ver checkout/actions.ts para
// el caso de invitado. Si hay sesión, se usa ese email y no se vuelve a
// pedir (ver CheckoutForm).
export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
        Finalizar compra
      </h1>
      <CheckoutForm initialEmail={user?.email} />
    </div>
  );
}
