import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Sincroniza los usuarios de Clerk con nuestra tabla User. El role siempre
// arranca en CUSTOMER acá: para hacer admin a alguien se cambia el campo
// `role` directamente en la base, nunca a través de este webhook.
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } =
      event.data;
    const email =
      email_addresses.find((e) => e.id === primary_email_address_id)
        ?.email_address ?? email_addresses[0]?.email_address;

    if (email) {
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;
      await prisma.user.upsert({
        where: { clerkId: id },
        update: { email, name },
        create: { clerkId: id, email, name },
      });
    }
  }

  if (event.type === "user.deleted" && event.data.id) {
    await prisma.user.deleteMany({ where: { clerkId: event.data.id } });
  }

  return NextResponse.json({ received: true });
}
