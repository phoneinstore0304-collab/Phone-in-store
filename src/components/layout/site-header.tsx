import Link from "next/link";
import { Search } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import { CartLink } from "@/components/cart/cart-link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

// Antes el nav mostraba las categorías; ahora esas viven más abajo como
// pills de categoría (ver CategoryPills en la home) y acá quedan los
// enlaces generales del sitio. Catálogo/Envíos/Contacto anclan a secciones
// de la home y del footer (ver id="catalogo" y id="contacto").
const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#contacto", label: "Envíos" },
  { href: "/#contacto", label: "Contacto" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-border bg-background/90 px-6 py-4 font-heading backdrop-blur sm:px-10">
      <Logo />
      <nav className="hidden items-center gap-8 text-[13px] font-semibold text-foreground/65 md:flex">
        {navLinks.map((link, index) => (
          <Link
            key={link.label + index}
            href={link.href}
            className="transition-colors duration-200 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3.5">
        <MobileMenu />
        {/* Decorativo por ahora: todavía no hay una búsqueda real armada. */}
        <button type="button" aria-label="Buscar" className="hidden p-1.5 text-foreground sm:flex">
          <Search className="size-5" />
        </button>
        <CartLink />
        <Show when="signed-out">
          <SignInButton>
            <button className="text-sm text-foreground/70 transition-colors duration-200 hover:text-foreground">
              Ingresar
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={buttonVariants({ size: "sm" })}>
              Panel admin
            </Link>
          )}
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
