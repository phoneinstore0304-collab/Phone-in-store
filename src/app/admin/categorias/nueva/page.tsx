import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Nueva categoría</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
