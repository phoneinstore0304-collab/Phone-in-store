import { WithdrawalForm } from "@/components/withdrawal/withdrawal-form";

// Resolución 424/2020: el Botón de Arrepentimiento tiene que llevar acá,
// a un formulario accesible sin necesidad de iniciar sesión ni completar
// pasos de más.
export default function WithdrawalPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
          Botón de Arrepentimiento
        </h1>
        <p className="text-sm text-zinc-500">
          Tenés derecho a arrepentirte de tu compra dentro de los 10 días corridos desde que la
          recibiste, sin necesidad de dar ningún motivo (Art. 34, Ley 24.240). Completá este
          formulario y te contactamos para coordinar la devolución.
        </p>
      </div>
      <WithdrawalForm />
    </div>
  );
}
