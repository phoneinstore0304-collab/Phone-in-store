"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Promotion } from "@/generated/prisma/client";

// Con más de esto los puntitos no entran cómodos en una fila — a partir de
// acá la tira queda con ancho fijo, difuminada en los bordes, y se
// desplaza sola para mantener a la vista el punto activo.
const MAX_DOTS_BEFORE_SCROLL = 5;

export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const manyDots = promotions.length > MAX_DOTS_BEFORE_SCROLL;

  // Sincroniza los puntitos de abajo con el slide que embla tiene activo
  // (por autoplay, flechas, drag o swipe — cualquier forma de cambiar de slide).
  useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    api.on("select", () => setSelected(api.selectedScrollSnap()));
  }, [api]);

  // Cuando hay demasiados puntos para mostrar todos, sigue al activo dentro
  // de la tira difuminada (scrollIntoView funciona con overflow-hidden
  // igual, solo no muestra la barra de scroll).
  useEffect(() => {
    if (manyDots) {
      dotRefs.current[selected]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selected, manyDots]);

  if (promotions.length === 0) return null;

  return (
    <div className="animate-in fade-in-0 duration-700">
      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        plugins={[
          Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }),
        ]}
        className="relative w-full bg-black"
      >
        <CarouselContent className="-ml-0">
          {promotions.map((promo) => (
            <CarouselItem key={promo.id} className="pl-0">
              <Link
                href={promo.link ?? "#"}
                // Alto fijo (no calculado a partir de ninguna proporción):
                // el pedido puntual fue "un tercio de la altura actual, no
                // importa si la imagen no entra bien" — con relative +
                // overflow-hidden + Image "fill" + object-cover, la imagen
                // se recorta para llenar este alto, sea cual sea su forma.
                className="group/slide relative block h-24 w-full overflow-hidden sm:h-32 lg:h-[170px]"
              >
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover/slide:scale-105"
                  sizes="100vw"
                  priority
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {promotions.length > 1 && (
          <>
            <CarouselPrevious className="left-4 transition-transform hover:scale-110" />
            <CarouselNext className="right-4 transition-transform hover:scale-110" />

            <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
              <div
                className={`flex items-center gap-2 ${
                  manyDots
                    ? "max-w-28 overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
                    : ""
                }`}
              >
                {promotions.map((promo, index) => (
                  <button
                    key={promo.id}
                    ref={(el) => {
                      dotRefs.current[index] = el;
                    }}
                    type="button"
                    aria-label={`Ir al banner ${index + 1}`}
                    aria-current={index === selected}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                      index === selected ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
