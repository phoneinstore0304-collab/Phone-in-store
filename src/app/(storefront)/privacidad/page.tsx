import { siteConfig } from "@/config/site";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-lg font-bold text-zinc-900">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
          Política de privacidad
        </h1>
        <p className="text-sm text-zinc-500">Última actualización: octubre de 2026.</p>
      </div>

      <Section title="Responsable del tratamiento">
        <p>
          {siteConfig.seller.legalName}, CUIT {siteConfig.seller.cuit}, con domicilio en{" "}
          {siteConfig.seller.legalAddress}, es responsable del tratamiento de los datos
          personales que recolecta este sitio.
        </p>
      </Section>

      <Section title="Qué datos recolectamos">
        <p>
          Nombre, email, teléfono y, si corresponde, datos del equipo que ofrezcas en Plan Canje.
          No pedimos dirección de envío porque la entrega es retiro en el local.
        </p>
      </Section>

      <Section title="Para qué los usamos">
        <p>
          Para gestionar tu pedido y contactarte en relación a él, para procesar cotizaciones de
          Plan Canje, y para responder pedidos de arrepentimiento o reclamos.
        </p>
      </Section>

      <Section title="Con quién los compartimos">
        <p>
          Con Mercado Pago, únicamente para procesar el pago. No vendemos ni compartimos tus
          datos con terceros para fines publicitarios.
        </p>
      </Section>

      <Section title="Tus derechos">
        <p>
          Tenés derecho a acceder, rectificar y suprimir tus datos personales (Ley 25.326). Para
          ejercerlos, escribinos a {siteConfig.seller.contactEmail}. La Agencia de Acceso a la
          Información Pública, como órgano de control de la Ley 25.326, tiene la atribución de
          atender denuncias y reclamos que interpongan quienes resulten afectados en sus derechos
          por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </Section>
    </div>
  );
}
