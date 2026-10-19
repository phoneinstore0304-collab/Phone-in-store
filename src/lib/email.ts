import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";

// Se manda desde el Gmail del negocio usando SMTP + una "contraseña de
// aplicación" (se genera una vez en la cuenta de Google, no es un login
// interactivo) — gratis, sin depender de ningún servicio externo de email.
function getTransport() {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) {
    throw new Error(
      "El envío de emails no está configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD).",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: appPassword },
  });
}

export type OrderEmailItem = { name: string; price: number; quantity: number };

export async function sendOrderPaidEmail(order: {
  id: string;
  to: string;
  items: OrderEmailItem[];
  total: number;
}) {
  const transport = getTransport();
  const from = process.env.GMAIL_USER!;

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#3f3f46;">${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</td>
          <td style="padding:8px 0;text-align:right;color:#18181b;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#18181b;">
      <h1 style="font-size:20px;">¡Gracias por tu compra!</h1>
      <p style="color:#52525b;">Tu pago fue aprobado. Acá está el resumen de tu pedido:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding-top:12px;border-top:1px solid #e4e4e7;font-weight:700;">Total</td>
          <td style="padding-top:12px;border-top:1px solid #e4e4e7;text-align:right;font-weight:700;">${formatPrice(order.total)}</td>
        </tr>
      </table>
      <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin-top:16px;">
        <p style="margin:0 0 4px;font-weight:700;">Retirás en el local</p>
        <p style="margin:0;color:#52525b;">${siteConfig.storeAddress}</p>
        <p style="margin:0;color:#52525b;">${siteConfig.storeHours}</p>
      </div>
    </div>
  `;

  await transport.sendMail({
    from: `"${siteConfig.name}" <${from}>`,
    to: order.to,
    subject: `Pedido confirmado — ${siteConfig.name}`,
    html,
  });
}
