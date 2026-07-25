"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: string;
  images: string[];
};

// Buscador con autocompletado para saltar directo a un producto puntual
// cuando hay demasiados como para revisarlos uno por uno en la tabla.
export function ProductSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    // Esperamos un toque después de que el admin deja de tipear para no
    // mandar un pedido al servidor por cada letra.
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/admin/productos/buscar?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setResults(data.products);
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
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectProduct(product: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(`/admin/productos/${product.id}/editar`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Input
        placeholder="Buscar producto por nombre..."
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
            <p className="px-3 py-2 text-sm text-zinc-500">
              No hay productos que coincidan.
            </p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => selectProduct(product)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                      <ProductImage src={product.images[0]} alt="" sizes="40px" />
                    </span>
                    <span className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-medium text-zinc-900">
                        {product.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
