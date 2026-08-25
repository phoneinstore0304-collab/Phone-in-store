import { z } from "zod";

export const tradeInSchema = z.object({
  fullName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),

  model: z.string().trim().min(1, "El modelo es obligatorio"),
  storageGb: z.coerce.number().int().positive("Elegí el almacenamiento"),
  batteryHealth: z.coerce
    .number()
    .int()
    .min(0, "Tiene que estar entre 0 y 100")
    .max(100, "Tiene que estar entre 0 y 100"),

  hasOriginalBox: z.boolean(),

  hasFrameDetail: z.boolean(),
  hasBackDetail: z.boolean(),
  hasCameraSmudge: z.boolean(),
  hasScreenScratch: z.boolean(),
  cosmeticNotes: z.string().trim().optional().or(z.literal("")),

  hasRepairs: z.boolean(),
  repairsDetail: z.string().trim().optional().or(z.literal("")),
  hasWarranty: z.boolean(),
  boughtNew: z.boolean(),

  hasBreakage: z.boolean(),
  breakageDetail: z.string().trim().optional().or(z.literal("")),
  hasFunctionalIssues: z.boolean(),
  functionalIssuesDetail: z.string().trim().optional().or(z.literal("")),

  notes: z.string().trim().optional().or(z.literal("")),

  // Se valida server-side también, no solo en el popup del cliente: sin
  // esto no se guarda el pedido (ver createTradeInRequest).
  acceptedTerms: z.literal(true, {
    error: "Tenés que aceptar los términos y condiciones para ver tu cotización",
  }),
});

export type TradeInInput = z.infer<typeof tradeInSchema>;
