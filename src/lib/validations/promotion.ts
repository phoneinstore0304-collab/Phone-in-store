import { z } from "zod";

export const promotionSchema = z
  .object({
    title: z.string().trim().min(1, "El título es obligatorio"),
    link: z.string().trim().optional(),
    order: z.coerce.number().int().nonnegative(),
    activeFrom: z.coerce.date({ message: "Fecha de inicio inválida" }),
    activeTo: z.coerce.date({ message: "Fecha de fin inválida" }),
  })
  .refine((data) => data.activeTo > data.activeFrom, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["activeTo"],
  });

export type PromotionInput = z.infer<typeof promotionSchema>;
