import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-zinc-900">Admin</span>
          <nav className="flex gap-4 text-sm text-zinc-600">
            <Link href="/admin" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/admin/productos" className="hover:text-zinc-900">
              Productos
            </Link>
            <Link href="/admin/promociones" className="hover:text-zinc-900">
              Promociones
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span>{admin.email}</span>
          <Link href="/" className="hover:text-zinc-900">
            Volver a la tienda
          </Link>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
