// URL pública del sitio, para armar links absolutos (back_urls y
// notification_url de Mercado Pago, que no aceptan rutas relativas).
// NEXT_PUBLIC_SITE_URL se define a mano en producción; VERCEL_URL lo pone
// Vercel automáticamente en cada deploy si no se definió nada; en local
// cae en localhost.
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
