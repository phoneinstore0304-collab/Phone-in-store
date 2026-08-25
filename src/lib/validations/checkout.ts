import { z } from "zod";

export const shippingInfoSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio"),
  phone: z.string().trim().min(1, "El teléfono es obligatorio"),
  address: z.string().trim().min(1, "La dirección es obligatoria"),
  city: z.string().trim().min(1, "La ciudad es obligatoria"),
  province: z.string().trim().min(1, "La provincia es obligatoria"),
  postalCode: z.string().trim().min(1, "El código postal es obligatorio"),
  notes: z.string().trim().optional(),
});

export type ShippingInfo = z.infer<typeof shippingInfoSchema>;

// Lo que el carrito (Zustand, cliente) le manda a la Server Action de
// checkout — cantidades y productId nada más. El precio NUNCA se toma de
// acá: se vuelve a buscar en la base server-side (ver checkout/actions.ts),
// así un cliente no puede mandar un precio trucho desde el navegador.
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
  shippingInfo: shippingInfoSchema,
});
