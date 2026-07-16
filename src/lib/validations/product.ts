import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    slug: z
      .string()
      .trim()
      .min(1, "El slug es obligatorio")
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Solo minúsculas, números y guiones (ej: iphone-13-128gb)",
      ),
    description: z.string().trim().min(1, "La descripción es obligatoria"),
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    categoryId: z.string().min(1, "Elegí una categoría"),
    isUsed: z.boolean(),
    condition: z.enum(["A", "B", "C"]).optional(),
    quantity: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => data.isUsed || data.quantity !== undefined, {
    message: "Los productos sellados necesitan una cantidad en stock",
    path: ["quantity"],
  });

export type ProductInput = z.infer<typeof productSchema>;
