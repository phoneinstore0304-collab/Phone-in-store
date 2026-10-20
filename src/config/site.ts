export const siteConfig = {
  name: "Phone in Store",
  description:
    "Compra y venta de productos Apple usados y tecnología en Argentina.",
  locale: "es-AR",
  currency: "ARS",
  // Usado en el footer y en el checkout (retiro en el local) — un solo
  // lugar para no tener la dirección/horario duplicados y desincronizados.
  storeAddress: "Av. Alvear 182, Martinez Bs. As.",
  storeHours: "Lun a Sáb · 10 a 12:30hs - 15 a 18:30hs",
  // Datos del vendedor para Términos y Condiciones / Política de
  // Privacidad / Botón de Arrepentimiento — exigidos por la Resolución
  // 424/2020 y la Ley de Defensa del Consumidor. Domicilio legal
  // confirmado como el mismo del local (Local 4).
  seller: {
    legalName: "Celeste Almendros Salvatierra",
    cuit: "27452840044",
    taxStatus: "Responsable Monotributo",
    legalAddress: "Av. Alvear 182, Local 4, Martinez, Buenos Aires",
    contactEmail: "phoneinstore0304@gmail.com",
    contactPhones: ["11 3136-8678", "11 5338-1052"],
  },
} as const;
