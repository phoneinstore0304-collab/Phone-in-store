import { z } from "zod";

// Por ahora el checkout solo soporta retiro en el local — el envío a
// domicilio se agrega más adelante. `method` queda igual guardado para que,
// cuando se sume el envío, los pedidos viejos se puedan distinguir sin
// tener que migrar nada.
export const shippingInfoSchema = z.object({
  method: z.literal("pickup"),
  fullName: z.string().trim().min(1, "El nombre es obligatorio"),
  phone: z.string().trim().min(1, "El teléfono es obligatorio"),
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
  // Solo hace falta si no hay sesión iniciada — createOrder exige esto a
  // mano para el caso de invitado, en vez de requerirlo siempre acá.
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
});
