"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/generated/prisma/client";
import type { ProductFormState } from "@/app/admin/productos/actions";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Sacar una foto (existente o recién elegida): la miniatura entera es el
// botón — al pasar el mouse se oscurece y aparece una cruz encima, y con eso
// ya queda claro que un click ahí la saca (sin un botón chiquito aparte).
function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Sacar foto"
      className="group relative size-16 shrink-0 animate-in zoom-in-95 overflow-hidden rounded-lg border border-zinc-200 duration-150"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-16 object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-zinc-900/0 opacity-0 transition-all duration-150 group-hover:bg-zinc-900/60 group-hover:opacity-100">
        <X className="size-6 scale-75 text-white transition-transform duration-150 group-hover:scale-100" />
      </span>
    </button>
  );
}

// Muestra las fotos que el producto ya tiene (se pueden sacar una por una
// con la ×) y permite agregar más sin perder las que quedaron — el botón de
// "+" abre el selector de archivos y cada foto nueva se suma a la lista, no
// la reemplaza. Lo que queda de "existentes" viaja en inputs ocultos
// (name="keepImages"), y los archivos nuevos en el <input type="file"> de
// siempre — el servidor combina ambos (ver readKeptImages en actions.ts).
function ImagePicker({ existingImages }: { existingImages: string[] }) {
  const [keptImages, setKeptImages] = useState(existingImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  // El <input type="file"> real tiene que reflejar `newFiles` para que el
  // FormData del <form> mande justo lo que quedó después de sacar alguna
  // con la × (los <input type="file"> no aceptan asignarles `value`, así
  // que se reconstruye su FileList con DataTransfer).
  useEffect(() => {
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  }, [newFiles]);

  return (
    <div className="flex flex-col gap-2">
      {keptImages.map((src) => (
        <input key={src} type="hidden" name="keepImages" value={src} />
      ))}

      <div className="flex flex-wrap gap-2">
        {keptImages.map((src) => (
          <ImageThumb
            key={src}
            src={src}
            onRemove={() => setKeptImages((prev) => prev.filter((url) => url !== src))}
          />
        ))}
        {previewUrls.map((src, index) => (
          <ImageThumb
            key={src}
            src={src}
            onRemove={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
          />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Agregar fotos"
          className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 transition-transform duration-150 hover:scale-105 hover:border-zinc-400 hover:text-zinc-600 active:scale-95"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <input
        ref={inputRef}
        id="images"
        name="images"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          if (selected.length > 0) setNewFiles((prev) => [...prev, ...selected]);
        }}
      />
    </div>
  );
}

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  // price como number, no Decimal: este componente es "use client", y un
  // Decimal de Prisma no se puede pasar como prop a través de ese límite.
  product?: Omit<Product, "price"> & { price: number };
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});

  // El navegador limpia los <input> del formulario después de cada submit
  // (comportamiento nativo de <form>, incluso cuando la acción del servidor
  // devuelve un error). Para no perder lo que el admin ya escribió,
  // remontamos el formulario con `key` cada vez que llega un `state` nuevo:
  // eso vuelve a aplicar `defaultValue` con `state.values`, que ya viene con
  // los campos válidos intactos y solo vacíos los que fallaron.
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setFormKey((key) => key + 1);
  }

  const values = state.values;
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={values?.name ?? product?.name}
          aria-invalid={Boolean(fieldErrors.name)}
          required
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <p className="text-xs text-zinc-500">
          Es la parte del nombre del producto que va en la URL de la página
          (ej: iphoneinstore.com/producto/<strong>iphone-13-128gb</strong>).
          Tiene que ser único, sin espacios ni acentos: solo minúsculas,
          números y guiones.
        </p>
        <Input
          id="slug"
          name="slug"
          defaultValue={values?.slug ?? product?.slug}
          placeholder="iphone-13-128gb"
          aria-invalid={Boolean(fieldErrors.slug)}
          required
        />
        {fieldErrors.slug && <p className="text-xs text-red-500">{fieldErrors.slug}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={values?.description ?? product?.description}
          required
          rows={4}
          aria-invalid={Boolean(fieldErrors.description)}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20"
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-500">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio (ARS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={values?.price ?? (product ? Number(product.price) : undefined)}
            aria-invalid={Boolean(fieldErrors.price)}
            required
          />
          {fieldErrors.price && <p className="text-xs text-red-500">{fieldErrors.price}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={values?.categoryId ?? product?.categoryId ?? ""}
            required
            className={selectClassName}
          >
            <option value="" disabled>
              Elegir...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-xs text-red-500">{fieldErrors.categoryId}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isUsed"
          name="isUsed"
          defaultChecked={values?.isUsed ?? product?.isUsed ?? true}
          className="size-4"
        />
        <Label htmlFor="isUsed">Es un producto Apple usado (unidad única)</Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition">Condición (solo usados)</Label>
          <select
            id="condition"
            name="condition"
            defaultValue={values?.condition ?? product?.condition ?? ""}
            className={selectClassName}
          >
            <option value="">-</option>
            <option value="A">Grado A</option>
            <option value="B">Grado B</option>
            <option value="C">Grado C</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Stock (solo sellados)</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            defaultValue={values?.quantity ?? product?.quantity ?? undefined}
            aria-invalid={Boolean(fieldErrors.quantity)}
          />
          {fieldErrors.quantity && (
            <p className="text-xs text-red-500">{fieldErrors.quantity}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="images">Fotos</Label>
        <ImagePicker existingImages={product?.images ?? []} />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
