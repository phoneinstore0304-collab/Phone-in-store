"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
        {/* key={selected}: remonta la foto grande en cada cambio para que
        el fade se repita cada vez, en vez de solo la primera vez. */}
        <div key={selected} className="absolute inset-0 animate-in fade-in duration-300">
          <ProductImage
            src={images[selected]}
            alt={alt}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              // Pasar el cursor por una miniatura la selecciona; click/foco
              // hacen lo mismo para que funcione con teclado y en celulares
              // (donde no existe el hover).
              onMouseEnter={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1} de ${images.length}`}
              aria-current={index === selected}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                index === selected
                  ? "border-primary scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <ProductImage src={image} alt="" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
