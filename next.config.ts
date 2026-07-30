import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase Storage (fotos subidas desde el admin, ver src/lib/storage.ts).
      {
        protocol: "https",
        hostname: "invmxdutrmeokialcojv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Desde Next 15, el optimizador de imágenes manda Content-Disposition:
    // attachment por defecto (pensado para cuando dangerouslyAllowSVG está
    // activo). Safari, a diferencia de Chrome/Firefox, respeta ese header
    // incluso en <img> embebidas y las trata como descarga en vez de
    // pintarlas — por eso las fotos de producto no aparecían ahí. No
    // servimos SVGs remotos, así que "inline" es seguro acá.
    contentDispositionType: "inline",
  },
  // Las fotos ya no viajan por Server Actions (van directo del navegador a
  // Supabase Storage, ver src/lib/upload-client.ts — Vercel corta cualquier
  // request de más de 4.5MB antes de que llegue a nuestro código, así que
  // subirlas por acá nunca iba a ser confiable). Los formularios ahora solo
  // mandan texto/URLs, el límite por defecto de Next alcanza de sobra.
};

export default nextConfig;
