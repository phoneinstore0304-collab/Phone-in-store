import Link from "next/link";

// El dashboard de estadísticas real (ventas, más vendidos, etc.) se
// construye en el paso 9 del roadmap.
export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Panel de administrador</h1>
      <div className="flex gap-4">
        <Link
          href="/admin/productos"
          className="rounded-xl border border-zinc-200 bg-white px-6 py-4 hover:border-zinc-300"
        >
          Productos
        </Link>
        <Link
          href="/admin/promociones"
          className="rounded-xl border border-zinc-200 bg-white px-6 py-4 hover:border-zinc-300"
        >
          Promociones
        </Link>
      </div>
    </div>
  );
}
