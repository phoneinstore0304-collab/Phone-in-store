import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

// Ícono de WhatsApp: no es un ícono genérico de lucide-react (esa librería
// no trae logos de marca), así que va como SVG inline con el path real del
// logo, igual que en el mockup de referencia.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    // width/height fijos además de la clase de Tailwind: un <svg> sin
    // atributos de tamaño propios puede quedar gigante si por lo que sea
    // el CSS todavía no aplicó su tamaño — con el atributo no depende de eso.
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={14}
      height={14}
      className={`shrink-0 ${className ?? ""}`}
    >
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.6 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.7-2.8-1.1-4.6-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 1.9.8 2 .1.2.1.4 0 .6-.5 1-1 .9-.5 1.7.9 1.5 1.8 2.1 3.2 2.8.2.1.4.1.5-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.7.8 2 1 .3.1.5.2.6.3.1.2.1.9-.1 1.5z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="contacto" className="relative overflow-hidden bg-[#0a0a0b] px-6 py-14 text-white sm:px-10">
      <span
        aria-hidden
        className="absolute top-1/3 right-3.5 hidden text-[10px] font-bold tracking-[0.3em] text-white/[0.08] uppercase [writing-mode:vertical-rl] sm:block"
      >
        {siteConfig.name}
      </span>

      <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={36} height={36} className="size-9" />
            <span className="text-sm font-bold tracking-widest text-white uppercase">
              {siteConfig.name}
            </span>
          </div>
          <p className="mt-3.5 max-w-[280px] text-[13px] leading-relaxed text-white/55">
            Local de tecnología con más de 8 años en el barrio. Productos
            originales, garantía directa y ahora también compra online.
          </p>
        </div>

        {/* Ofertas/Garantías todavía no tienen página propia — quedan como
        link muerto ("#") a propósito, calcado del mockup, hasta que se
        construyan. */}
        <div>
          <h4 className="mb-4 text-[12px] font-bold tracking-[0.1em] text-white/45 uppercase">
            Tienda
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-white/75">
            <li>
              <Link href="/#catalogo" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Ofertas
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Garantías
              </a>
            </li>
          </ul>
        </div>

        {/* Dirección y horario: placeholder calcado del mockup (a pedido —
        se reemplaza por los datos reales más adelante). El WhatsApp sí es
        el real, ya usado en los banners de Instagram. */}
        <div>
          <h4 className="mb-4 text-[12px] font-bold tracking-[0.1em] text-white/45 uppercase">
            Contacto
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-white/75">
            <li>
              <a
                href="https://wa.me/5491160060533"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-bold text-primary"
              >
                <WhatsAppIcon className="size-3.5" />
                11 6006-0533
              </a>
            </li>
            <li>Av. Siempre Viva 1234, CABA</li>
            <li>Lun a Sáb · 10 a 19hs</li>
            <li>Envíos a todo el país</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-6 text-[11.5px] text-white/45 sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
        </span>
        <span>Sitio construido como prototipo de marca</span>
      </div>
    </footer>
  );
}
