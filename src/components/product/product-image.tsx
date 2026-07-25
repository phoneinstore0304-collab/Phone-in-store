import Image from "next/image";
import { ImageOff } from "lucide-react";

export function ProductImage({
  src,
  alt,
  className,
  // Sin esto, next/image asume que la imagen puede ocupar el 100% del
  // viewport y tira un warning de performance en cada tarjeta (pide más
  // resolución de la que realmente se muestra). El default cubre la grilla
  // de productos (2 columnas en mobile, hasta 4 en desktop); las vistas más
  // chicas (miniaturas, buscador) pasan su propio valor.
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-zinc-100 text-zinc-300 ${className ?? ""}`}
      >
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
