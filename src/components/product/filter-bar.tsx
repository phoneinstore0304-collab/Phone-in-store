import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Formulario GET simple: no necesita JS, el navegador arma el query string
// y la página se vuelve a renderizar en el servidor con los filtros nuevos.
export function FilterBar({
  minPrice,
  maxPrice,
  condition,
}: {
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3 px-6 py-6 sm:px-10">
      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Precio mín.
        <Input
          type="number"
          name="minPrice"
          min={0}
          defaultValue={minPrice}
          className="w-32"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Precio máx.
        <Input
          type="number"
          name="maxPrice"
          min={0}
          defaultValue={maxPrice}
          className="w-32"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-600">
        Condición
        <select
          name="condition"
          defaultValue={condition ?? ""}
          className={selectClassName}
        >
          <option value="">Todas</option>
          <option value="A">Grado A</option>
          <option value="B">Grado B</option>
          <option value="C">Grado C</option>
        </select>
      </label>
      <Button type="submit" variant="outline">
        Filtrar
      </Button>
    </form>
  );
}
