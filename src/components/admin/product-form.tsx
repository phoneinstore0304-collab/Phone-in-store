"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImageDirect } from "@/lib/upload-client";
import type { Category, Product } from "@/generated/prisma/client";
import type { ProductFormState } from "@/app/admin/productos/actions";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Sacar una foto (existente o ya subida): la miniatura entera es el botón —
// al pasar el mouse se oscurece y aparece una cruz encima, y con eso ya
// queda claro que un click ahí la saca (sin un botón chiquito aparte).
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

type UploadEntry = {
  id: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  url?: string;
  errorMessage?: string;
};

function UploadThumb({ entry, onRemove }: { entry: UploadEntry; onRemove: () => void }) {
  if (entry.status === "uploading") {
    return (
      <div className="relative size-16 shrink-0 animate-in zoom-in-95 overflow-hidden rounded-lg border border-zinc-200 duration-150">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.previewUrl} alt="" className="size-16 object-cover opacity-50" />
        <span className="absolute inset-0 flex items-center justify-center bg-zinc-900/30">
          <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </span>
      </div>
    );
  }

  if (entry.status === "error") {
    return (
      <button
        type="button"
        onClick={onRemove}
        title={entry.errorMessage}
        aria-label={`Sacar (${entry.errorMessage})`}
        className="flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-red-300 bg-red-50 p-1 text-center text-[9px] leading-tight text-red-500 transition-transform hover:scale-105 active:scale-95"
      >
        <X className="size-4" />
        Error
      </button>
    );
  }

  return <ImageThumb src={entry.previewUrl} onRemove={onRemove} />;
}

// Muestra las fotos que el producto ya tiene (se pueden sacar una por una
// con la ×) y permite agregar más sin perder las que quedaron. Cada foto se
// sube directo del navegador a Supabase Storage apenas se elige (no viaja
// por el servidor: Vercel corta cualquier request de más de 4.5MB, y una
// foto de celular pasa eso fácil — ver storage.ts). Mientras sube se ve un
// spinner; el botón "Guardar" queda deshabilitado hasta que termine.
function ImagePicker({
  existingImages,
  folder,
  onUploadingChange,
}: {
  existingImages: string[];
  folder: "products" | "promotions";
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [keptImages, setKeptImages] = useState(existingImages);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploads.some((entry) => entry.status === "uploading");
  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  function handleFiles(fileList: FileList | null) {
    for (const file of Array.from(fileList ?? [])) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setUploads((prev) => [...prev, { id, previewUrl, status: "uploading" }]);

      uploadImageDirect(file, folder)
        .then((url) => {
          setUploads((prev) =>
            prev.map((entry) => (entry.id === id ? { ...entry, status: "done", url } : entry)),
          );
        })
        .catch((error: unknown) => {
          setUploads((prev) =>
            prev.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status: "error",
                    errorMessage: error instanceof Error ? error.message : "No se pudo subir",
                  }
                : entry,
            ),
          );
        });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {keptImages.map((src) => (
        <input key={src} type="hidden" name="keepImages" value={src} />
      ))}
      {uploads
        .filter((entry) => entry.status === "done" && entry.url)
        .map((entry) => (
          <input key={entry.id} type="hidden" name="newImages" value={entry.url} />
        ))}

      <div className="flex flex-wrap gap-2">
        {keptImages.map((src) => (
          <ImageThumb
            key={src}
            src={src}
            onRemove={() => setKeptImages((prev) => prev.filter((url) => url !== src))}
          />
        ))}
        {uploads.map((entry) => (
          <UploadThumb
            key={entry.id}
            entry={entry}
            onRemove={() => setUploads((prev) => prev.filter((u) => u.id !== entry.id))}
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
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          // Sin esto, elegir el mismo archivo dos veces seguidas (ej: sacarlo
          // y volver a agregarlo) no dispara "onChange" la segunda vez.
          event.target.value = "";
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
  const [imagesUploading, setImagesUploading] = useState(false);

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
        <ImagePicker
          existingImages={product?.images ?? []}
          folder="products"
          onUploadingChange={setImagesUploading}
        />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending || imagesUploading} className="w-fit">
        {imagesUploading
          ? "Subiendo fotos..."
          : pending
            ? "Guardando..."
            : product
              ? "Guardar cambios"
              : "Crear producto"}
      </Button>
    </form>
  );
}
