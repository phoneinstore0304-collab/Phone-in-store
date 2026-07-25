import Image from "next/image";
import { Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 py-14 sm:px-10 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgba(19,19,21,0.14)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black_40%,transparent_90%)]"
      />
      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
            Tienda física y online · CABA
          </p>
          <h1 className="mt-3.5 text-[clamp(34px,5vw,58px)] leading-[1.04] font-black tracking-tight text-foreground font-display">
            Tecnología original,{" "}
            <span className="bg-gradient-to-br from-[#ff8a4c] via-primary to-[#9c1c2e] bg-clip-text text-transparent">
              al mejor precio
            </span>{" "}
            del barrio.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-500">
            iPhone, Mac, notebooks, audio JBL y accesorios — con la garantía y
            el trato del local, ahora también con envíos a todo el país y
            cuotas fijas sin interés.
          </p>
          <div className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 sm:mt-12 sm:gap-2.5 sm:px-5 sm:py-3">
            <Truck className="size-3.5 shrink-0 text-primary sm:size-5" />
            <span className="text-xs font-bold whitespace-nowrap text-foreground sm:text-base">
              Envíos a todo el país
            </span>
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <div
            aria-hidden
            className="absolute size-[220px] rounded-full bg-gradient-to-br from-[#8b3cf7] to-[#12c6e6] opacity-55 blur-3xl sm:size-[340px]"
          />
          <div className="relative flex size-[180px] items-center justify-center rounded-full bg-black shadow-2xl sm:size-[260px]">
            <Image src="/logo.png" alt="" width={260} height={260} className="size-[92%]" />
          </div>
        </div>
      </div>
    </section>
  );
}
