"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/product/product-image";
import { ColorPicker } from "@/components/admin/color-picker";
import { linkVariant, unlinkVariant, updateVariantColor } from "@/app/admin/productos/actions";

type SearchResult = { id: string; name: string; slug: string; images: string[] };
type VariantProduct = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  colorHex: string | null;
  images: string[];
};

// Guarda el colorHex de una variante puntual con un debounce corto — así
// tipear a mano no dispara un guardado por letra, y elegir con el tintero
// (que ya entrega un hex completo) guarda casi al toque.
function VariantColorCell({
  variantId,
  initialHex,
  imageUrl,
}: {
  variantId: string;
  initialHex: string;
  imageUrl?: string;
}) {
  const router = useRouter();
  const [hex, setHex] = useState(initialHex);

  useEffect(() => {
    if (hex === initialHex) return;
    if (hex !== "" && !/^#[0-9a-fA-F]{6}$/.test(hex)) return;

    const timeout = setTimeout(async () => {
      await updateVariantColor(variantId, hex);
      router.refresh();
    }, 400);
    return () => clearTimeout(timeout);
  }, [hex, initialHex, variantId, router]);

  return <ColorPicker value={hex} onChange={setHex} imageUrl={imageUrl} />;
}

// Buscador + lista de variantes ya vinculadas, para la sección "Color /
// variantes" del formulario de edición de producto. Llama a las Server
// Actions directo (sin <form>, son mutaciones puntuales de un click) y usa
// router.refresh() después para que el resto de la página (el listado de
// variantes) se vuelva a pedir con los datos nuevos.
export function VariantLinker({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantProduct[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/admin/productos/buscar?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        const linkedIds = new Set([productId, ...variants.map((v) => v.id)]);
        setResults(
          (data.products as SearchResult[]).filter((product) => !linkedIds.has(product.id)),
        );
        setOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(error);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, productId, variants]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLink(other: SearchResult) {
    setPendingId(other.id);
    await linkVariant(productId, other.id);
    setPendingId(null);
    setQuery("");
    setOpen(false);
    router.refresh();
  }

  async function handleUnlink(variantId: string) {
    setPendingId(variantId);
    await unlinkVariant(variantId);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {variants.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {variants.map((variant) => (
            <li
              key={variant.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  <ProductImage src={variant.images[0]} alt="" sizes="32px" />
                </span>
                <span className="truncate">
                  {variant.name}
                  {variant.color && <span className="text-zinc-500"> — {variant.color}</span>}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <VariantColorCell
                  variantId={variant.id}
                  initialHex={variant.colorHex ?? ""}
                  imageUrl={variant.images[0]}
                />
                <button
                  type="button"
                  onClick={() => handleUnlink(variant.id)}
                  disabled={pendingId === variant.id}
                  className="shrink-0 text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  Desvincular
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div ref={containerRef} className="relative max-w-sm">
        <Input
          placeholder="Buscar producto para vincular como variante..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        />
        {open && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md">
            {results.length === 0 ? (
              <p className="px-3 py-2 text-sm text-zinc-500">No hay productos que coincidan.</p>
            ) : (
              <ul>
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleLink(product)}
                      disabled={pendingId === product.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50 disabled:opacity-50"
                    >
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        <ProductImage src={product.images[0]} alt="" sizes="32px" />
                      </span>
                      <span className="truncate">{product.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
