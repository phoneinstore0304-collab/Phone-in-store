import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/queries/products";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Nuevo producto</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
