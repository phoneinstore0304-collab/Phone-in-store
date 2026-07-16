import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// TEMPORAL: mientras no exista el proyecto de Supabase, las imágenes se
// guardan en el filesystem local (public/uploads). Cuando haya credenciales
// reales de Supabase Storage, esta es la única función que hay que cambiar
// (subir con el cliente de Supabase y devolver la URL pública en vez de
// escribir a disco).

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
  file: File,
  folder: "products" | "promotions",
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no soportado (usar JPG, PNG o WEBP).");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 5MB.");
  }

  const extension = file.type.split("/")[1];
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
