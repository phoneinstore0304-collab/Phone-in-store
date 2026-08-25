import { z } from "zod";

export const tradeInPriceSchema = z.object({
  model: z.string().trim().min(1, "El modelo es obligatorio"),
  storageGb: z.coerce.number().int().positive("El almacenamiento tiene que ser mayor a 0"),
  basePriceUsd: z.coerce.number().int().nonnegative("El precio no puede ser negativo"),
});

export type TradeInPriceInput = z.infer<typeof tradeInPriceSchema>;
