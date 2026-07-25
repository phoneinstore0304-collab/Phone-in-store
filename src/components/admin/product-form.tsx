"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/generated/prisma/client";
import type { ProductFormState } from "@/app/admin/productos/actions";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Miniaturas de las fotos elegidas en el <input type="file">, para que el
// admin vea qué va a subir antes de guardar. Si no se elige ninguna foto
// nueva, muestra las que el producto ya tiene (solo informativo: al editar,
// subir fotos nuevas reemplaza a todas las anteriores).
function ImagePicker({ existingImages }: { existingImages: string[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const thumbnails = files.length > 0 ? previewUrls : existingImages;

  return (
    <div className="flex flex-col gap-2">
      <input
        id="images"
        name="images"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
      />
      {files.length === 0 && existingImages.length > 0 && (
        <p className="text-xs text-zinc-500">
          Fotos actuales — subí fotos nuevas para reemplazarlas todas.
        </p>
      )}
      {thumbnails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {thumbnails.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src + index}
              src={src}
              alt=""
              className="size-16 rounded-lg border border-zinc-200 object-cover"
            />
          ))}
        </div>
      )}
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
  product?: Product;
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
        <Label htmlFor="images">
          Fotos {product ? "(dejar vacío para mantener las actuales)" : ""}
        </Label>
        <ImagePicker existingImages={product?.images ?? []} />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
