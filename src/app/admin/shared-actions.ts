"use server";

import { requireAdmin } from "@/lib/auth";
import { createSignedUploadUrl } from "@/lib/storage";

const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png", "webp"];

// Server Action compartida por los formularios de Productos y Promociones:
// solo autoriza la subida (chequea que sea admin y el formato) y devuelve
// una URL firmada — el archivo en sí lo sube el navegador directo a
// Supabase (ver src/lib/upload-client.ts), nunca pasa por acá.
export async function requestImageUpload(folder: "products" | "promotions", extension: string) {
  await requireAdmin();

  const ext = extension.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Formato de imagen no soportado (usar JPG, PNG o WEBP).");
  }

  return createSignedUploadUrl(folder, ext);
}
