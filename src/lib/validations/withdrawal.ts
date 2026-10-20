import { z } from "zod";

// Campos exigidos por la Resolución 424/2020 para el Botón de
// Arrepentimiento. `reason` queda opcional a propósito: el derecho de
// arrepentimiento es "sin necesidad de expresar causa" (Art. 34, Ley
// 24.240) — no se le puede exigir al consumidor que justifique por qué.
export const withdrawalSchema = z.object({
  documentType: z.string().trim().min(1, "Elegí el tipo de documento"),
  documentNumber: z.string().trim().min(1, "El número de documento es obligatorio"),
  orderCode: z.string().trim().min(1, "El código de la operación es obligatorio"),
  purchaseDate: z.string().trim().min(1, "La fecha de compra es obligatoria"),
  amount: z.coerce.number().positive("El monto tiene que ser mayor a 0"),
  productOrService: z.string().trim().min(1, "Contanos qué producto o servicio compraste"),
  reason: z.string().trim().optional().or(z.literal("")),
  contactEmail: z.string().trim().email("Email inválido"),
  contactPhone: z.string().trim().optional().or(z.literal("")),
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
