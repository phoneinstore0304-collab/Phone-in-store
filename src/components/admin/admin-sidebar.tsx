"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Tag, Megaphone, Users, Store } from "lucide-react";

const links = [
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/promociones", label: "Promociones", icon: Megaphone },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

const itemClass =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-black p-4">
      <Link href="/admin/productos" className="flex items-center gap-2 px-2">
        <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
        {/* !text-white a propósito: el color de texto por defecto del body
        es casi negro (--foreground), y esto asegura que acá siempre gane,
        sin depender de que ninguna otra clase lo pise por accidente. */}
        <span className="text-sm font-bold tracking-widest !text-white uppercase">Admin</span>
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        {links.map((link) => {
          // También resalta las subpáginas (ej: /admin/productos/nuevo).
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${itemClass} ${
                active
                  ? "bg-primary !text-white"
                  : "!text-white/60 hover:bg-white/10 hover:!text-white"
              }`}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}

        {/* Mismo estilo que el resto, pero nunca queda "activo" (no es una
        sección de /admin) — va último, dentro de la misma lista. */}
        <Link href="/" className={`${itemClass} !text-white/60 hover:bg-white/10 hover:!text-white`}>
          <Store className="size-4" />
          Volver a la tienda
        </Link>
      </nav>

      <span className="mt-auto truncate px-3 pt-4 text-xs !text-white/40">{adminEmail}</span>
    </aside>
  );
}
