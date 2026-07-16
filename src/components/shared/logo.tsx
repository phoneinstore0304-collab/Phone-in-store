import Link from "next/link";
import { siteConfig } from "@/config/site";

// Placeholder de texto. Reemplazar por el isotipo/imagen definitivo cuando esté listo,
// sin tocar los lugares donde se usa <Logo />.
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <span className="text-lg font-semibold tracking-tight text-zinc-900">
        {siteConfig.name}
      </span>
    </Link>
  );
}
