import Link from "next/link";
import { siteConfig } from "@/config/site";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-lg font-bold text-zinc-900">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
          Términos y condiciones
        </h1>
        <p className="text-sm text-zinc-500">Última actualización: octubre de 2026.</p>
      </div>

      <Section title="1. Identificación del vendedor">
        <p>
          {siteConfig.seller.legalName}, CUIT {siteConfig.seller.cuit},{" "}
          {siteConfig.seller.taxStatus}, con domicilio en {siteConfig.seller.legalAddress}{" "}
          (en adelante, &quot;{siteConfig.name}&quot;).
        </p>
        <p>
          Contacto: {siteConfig.seller.contactEmail} ·{" "}
          {siteConfig.seller.contactPhones.join(" · ")}
        </p>
      </Section>

      <Section title="2. Objeto">
        <p>
          {siteConfig.name} comercializa productos Apple usados (unidades únicas, graduadas por
          estado estético) y productos de tecnología nuevos y sellados de terceros, a través de
          este sitio web.
        </p>
      </Section>

      <Section title="3. Proceso de compra y precios">
        <p>
          Los precios están expresados en pesos argentinos e incluyen los impuestos que
          correspondan. Pueden modificarse sin previo aviso hasta el momento en que se confirma
          una compra — una vez confirmado el pago, el precio pagado queda fijo para esa operación.
        </p>
        <p>No hace falta crear una cuenta para comprar.</p>
      </Section>

      <Section title="4. Medios de pago">
        <p>Los pagos se procesan a través de Mercado Pago.</p>
      </Section>

      <Section title="5. Entrega">
        <p>
          Por el momento, la modalidad de entrega es exclusivamente retiro en el local:{" "}
          {siteConfig.storeAddress}, en el horario {siteConfig.storeHours}.
        </p>
      </Section>

      <Section title="6. Garantías">
        <p>
          Los productos Apple usados se describen con el estado estético y de funcionamiento
          declarado al momento de la publicación. Los productos nuevos sellados cuentan con la
          garantía que corresponda según el fabricante o importador.
        </p>
      </Section>

      <Section title="7. Derecho de arrepentimiento">
        <p>
          Como consumidor, tenés derecho a revocar tu compra dentro de los 10 días corridos desde
          que recibiste el producto, sin necesidad de expresar causa (Art. 34, Ley 24.240). Para
          ejercerlo, usá el{" "}
          <Link href="/arrepentimiento" className="font-medium text-primary underline">
            Botón de Arrepentimiento
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Datos personales">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <Link href="/privacidad" className="font-medium text-primary underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          Estos términos pueden actualizarse en cualquier momento — la versión vigente es siempre
          la publicada en esta página.
        </p>
      </Section>

      <Section title="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina, en particular la Ley
          24.240 de Defensa del Consumidor.
        </p>
      </Section>
    </div>
  );
}
