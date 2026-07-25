import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
  // Next.js limita el body de un Server Action a 1MB por defecto. Los
  // formularios de admin (productos/promociones) suben fotos vía Server
  // Action y ya validan hasta 5MB por imagen en src/lib/storage.ts — sin
  // este límite más alto, cualquier foto de celular normal rebota antes de
  // llegar a esa validación. 20mb cubre varias fotos de producto a la vez.
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
