import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones (ej: iphone-usados)"),
  order: z.coerce.number().int().nonnegative(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
