import { supabaseBrowser } from "@/lib/supabase-browser";
import { requestImageUpload } from "@/app/admin/shared-actions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// Sube un archivo directo del navegador a Supabase Storage (no pasa por
// Vercel — ver la nota en storage.ts sobre el límite de 4.5MB). Devuelve la
// URL pública final.
export async function uploadImageDirect(
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
  const { path, token, publicUrl } = await requestImageUpload(folder, extension);

  const { error } = await supabaseBrowser.storage.from("uploads").uploadToSignedUrl(path, token, file);
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  return publicUrl;
}
