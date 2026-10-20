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
  orderNumber: number;
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
      <p style="color:#52525b;">
        Tu pago fue aprobado. Pedido <strong>#${order.orderNumber}</strong> — guardá este número
        para identificarlo.
      </p>
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
    subject: `Pedido #${order.orderNumber} confirmado — ${siteConfig.name}`,
    html,
  });
}

// La Resolución 424/2020 exige avisarle "de forma inmediata" al
// consumidor que se recibió su pedido de arrepentimiento — este mail
// cumple eso. No es la resolución del reclamo en sí, solo el acuse de
// recibo.
export async function sendWithdrawalConfirmationEmail(request: { to: string; id: string }) {
  const transport = getTransport();
  const from = process.env.GMAIL_USER!;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#18181b;">
      <h1 style="font-size:20px;">Recibimos tu solicitud de arrepentimiento</h1>
      <p style="color:#52525b;">
        Ya la tenemos registrada (referencia <strong>${request.id}</strong>) y te vamos a
        contactar a la brevedad para coordinar la devolución, según lo previsto por la Ley de
        Defensa del Consumidor.
      </p>
    </div>
  `;

  await transport.sendMail({
    from: `"${siteConfig.name}" <${from}>`,
    to: request.to,
    subject: `Recibimos tu solicitud de arrepentimiento — ${siteConfig.name}`,
    html,
  });
}

// Aviso interno al negocio de que llegó un pedido de arrepentimiento —
// sin esto, nadie se entera salvo que entre a revisar el admin a mano.
export async function sendWithdrawalNotificationToOwner(request: {
  id: string;
  documentType: string;
  documentNumber: string;
  orderCode: string;
  productOrService: string;
  contactEmail: string;
  contactPhone?: string;
}) {
  const transport = getTransport();
  const from = process.env.GMAIL_USER!;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#18181b;">
      <h1 style="font-size:20px;">Nuevo pedido de arrepentimiento</h1>
      <p style="color:#52525b;">Código de operación: <strong>${request.orderCode}</strong></p>
      <p style="color:#52525b;">Producto/servicio: ${request.productOrService}</p>
      <p style="color:#52525b;">
        Documento: ${request.documentType} ${request.documentNumber}
      </p>
      <p style="color:#52525b;">
        Contacto: ${request.contactEmail}${request.contactPhone ? ` · ${request.contactPhone}` : ""}
      </p>
      <p style="color:#52525b;">Revisalo en el panel de admin, sección Arrepentimientos.</p>
    </div>
  `;

  await transport.sendMail({
    from: `"${siteConfig.name}" <${from}>`,
    to: from,
    subject: `Pedido de arrepentimiento — ${request.orderCode}`,
    html,
  });
}
