import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Supabase Storage: el filesystem de Vercel es de solo lectura en producción
// (salvo /tmp, que tampoco persiste entre requests), así que las imágenes no
// se pueden guardar a disco como en local. Bucket "uploads", público, creado
// una sola vez con supabase.storage.createBucket().
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

// El archivo NO se sube acá (Server Action / API route de Vercel): las
// funciones serverless de Vercel cortan cualquier request de más de 4.5MB
// ANTES de que nuestro código la vea (esto es un límite del gateway, no de
// Next.js — el bodySizeLimit de next.config.ts no lo puede levantar). Una
// foto sacada con el celular pasa ese límite fácil. La solución: el server
// solo genera una URL firmada de subida, y el navegador sube el archivo
// directo a Supabase — el archivo nunca pasa por Vercel.
export async function createSignedUploadUrl(
  folder: "products" | "promotions",
  extension: string,
) {
  const path = `${folder}/${randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from("uploads").createSignedUploadUrl(path);
  if (error) throw new Error(`No se pudo preparar la subida: ${error.message}`);

  return {
    path: data.path,
    token: data.token,
    publicUrl: supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl,
  };
}
