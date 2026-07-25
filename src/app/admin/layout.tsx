import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar adminEmail={admin.email} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
