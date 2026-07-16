import Image from "next/image";
import { ImageOff } from "lucide-react";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
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
      className={`object-cover ${className ?? ""}`}
    />
  );
}
