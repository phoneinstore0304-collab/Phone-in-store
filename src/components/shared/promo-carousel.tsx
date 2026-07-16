"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Promotion } from "@/generated/prisma/client";

export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <Carousel opts={{ loop: true }} className="w-full">
      <CarouselContent className="-ml-0">
        {promotions.map((promo) => (
          <CarouselItem key={promo.id} className="pl-0">
            <Link
              href={promo.link ?? "#"}
              className="relative block aspect-[16/6] w-full overflow-hidden sm:aspect-[16/5]"
            >
              {/* <img> en vez de next/image: son SVG locales (vectoriales),
              no se benefician de la optimización de raster de next/image. */}
              <img
                src={promo.image}
                alt={promo.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {promotions.length > 1 && (
        <>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </>
      )}
    </Carousel>
  );
}
