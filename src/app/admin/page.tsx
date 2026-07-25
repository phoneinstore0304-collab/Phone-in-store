import { redirect } from "next/navigation";

// No hay un dashboard de estadísticas todavía (eso es el paso 9 del
// roadmap) — mientras tanto, entrar a /admin lleva directo a Productos en
// vez de mostrar una pantalla intermedia vacía.
export default function AdminPage() {
  redirect("/admin/productos");
}
