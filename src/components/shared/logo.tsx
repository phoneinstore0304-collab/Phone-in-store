import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";

// Red Ring: tipografía paga (Letterhead Studio / Yuri Gordon), no es de
// Google Fonts — se autohostea el archivo local en vez de bajarla de un CDN.
// Solo se usa acá, para el wordmark del navbar (no reemplaza --font-heading,
// que también usan otros componentes como los títulos de las cards).
const redRing = localFont({
  src: "../../fonts/red-ring/RedRing-Bold.woff2",
  display: "swap",
});

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <Image src="/logo.png" alt="" width={40} height={40} className="size-9" priority />
      <span className={`${redRing.className} text-lg tracking-widest text-foreground uppercase`}>
        {siteConfig.name}
      </span>
    </Link>
  );
}
