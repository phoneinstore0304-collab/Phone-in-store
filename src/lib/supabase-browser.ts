import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador: usa la clave pública (no la
// secreta), y solo se usa para subir archivos a una URL ya firmada por el
// servidor (ver requestImageUpload en admin/shared-actions.ts) — nunca para
// leer/escribir datos directamente.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
