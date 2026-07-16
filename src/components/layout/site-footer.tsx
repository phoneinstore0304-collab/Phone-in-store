import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-8 text-sm text-zinc-500 sm:px-10">
      © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
    </footer>
  );
}
