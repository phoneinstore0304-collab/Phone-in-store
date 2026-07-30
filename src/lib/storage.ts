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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function uploadImage(
  file: File,
  folder: "products" | "promotions",
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no soportado (usar JPG, PNG o WEBP).");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 8MB.");
  }

  const extension = file.type.split("/")[1];
  const filename = `${folder}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("uploads").upload(filename, buffer, {
    contentType: file.type,
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  return supabase.storage.from("uploads").getPublicUrl(filename).data.publicUrl;
}

export async function uploadImages(
  files: File[],
  folder: "products" | "promotions",
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImage(file, folder));
  }
  return urls;
}
