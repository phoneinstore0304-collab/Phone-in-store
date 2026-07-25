"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#contacto", label: "Envíos" },
  { href: "/#contacto", label: "Contacto" },
];

// No existía ninguna forma de ver el nav en mobile (el <nav> del header
// tiene "hidden md:flex" y no hay alternativa) — este es el reemplazo:
// botón hamburguesa + panel que se desliza desde la izquierda.
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="flex p-1.5 text-foreground md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55 animate-in fade-in duration-200"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-in slide-in-from-left flex-col bg-background p-5 duration-200">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-bold tracking-widest uppercase">Menú</span>
              <button type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {links.map((link, index) => (
                <Link
                  key={link.label + index}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3.5 text-base font-semibold text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
