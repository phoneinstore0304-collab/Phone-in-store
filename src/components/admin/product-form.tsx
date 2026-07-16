"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/generated/prisma/client";
import type { ProductFormState } from "@/app/admin/productos/actions";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={product?.slug}
          placeholder="iphone-13-128gb"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          required
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio (ARS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            defaultValue={product ? Number(product.price) : undefined}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
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
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isUsed"
          name="isUsed"
          defaultChecked={product?.isUsed ?? true}
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
            defaultValue={product?.condition ?? ""}
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
            defaultValue={product?.quantity ?? undefined}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">
          Foto {product ? "(dejar vacío para mantener la actual)" : ""}
        </Label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
