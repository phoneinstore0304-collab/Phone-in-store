"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

// Envoltorio del modal de producto (ver @modal/(.)producto/[slug]/page.tsx).
// router.back() en vez de navegar a otro lado: así el botón "atrás" del
// navegador también cierra el modal de forma natural.
export function ProductModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function close() {
    router.back();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={close}
        className="absolute inset-0 animate-in fade-in bg-black/60 backdrop-blur-sm duration-200"
      />
      <div className="relative max-h-[92vh] w-full max-w-6xl animate-in zoom-in-95 overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl duration-200 sm:p-10">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
