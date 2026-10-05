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
} as const;
