import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getSiteUrl } from "@/lib/site-url";

function getAccessToken() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Mercado Pago no está configurado todavía (falta MP_ACCESS_TOKEN en las variables de entorno).",
    );
  }
  return accessToken;
}

function getClient() {
  return new MercadoPagoConfig({ accessToken: getAccessToken() });
}

export type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

// Crea la preferencia de pago (Checkout Pro) para un pedido y devuelve la
// URL a la que hay que mandar al comprador. Con credenciales de test, esa
// URL tiene que ser la de sandbox — con las de test, "init_point" no
// funciona para pagar de verdad, hay que usar "sandbox_init_point".
export async function createCheckoutPreference(order: {
  id: string;
  items: PreferenceItem[];
  payerEmail?: string;
}) {
  const client = getClient();
  const preference = new Preference(client);
  const baseUrl = getSiteUrl();

  const response = await preference.create({
    body: {
      items: order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      payer: order.payerEmail ? { email: order.payerEmail } : undefined,
      external_reference: order.id,
      back_urls: {
        success: `${baseUrl}/pedido/${order.id}`,
        pending: `${baseUrl}/pedido/${order.id}`,
        failure: `${baseUrl}/pedido/${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    },
  });

  // Ni el prefijo del access token ni qué campos vengan en la respuesta
  // sirven para saber si estamos en modo prueba: ya vimos credenciales de
  // test con prefijo "APP_USR-" (no "TEST-"), y con la cuenta real de
  // producción la API devolvió igual tanto init_point como
  // sandbox_init_point los dos juntos. La única señal confiable es que lo
  // digamos nosotros a propósito con MP_USE_SANDBOX.
  const useSandbox = process.env.MP_USE_SANDBOX === "true";
  const url = useSandbox ? response.sandbox_init_point : response.init_point;
  if (!url) throw new Error("Mercado Pago no devolvió una URL de pago.");
  return url;
}

// Nunca hay que confiar en los query params del redirect de vuelta (los
// puede editar cualquiera) — esto trae el estado real y autoritativo desde
// Mercado Pago, se usa desde el webhook para actualizar el Order.
export async function getPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
