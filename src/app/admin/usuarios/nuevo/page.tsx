import { UserForm } from "@/components/admin/user-form";
import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Nuevo cliente</h1>
      <UserForm action={createUser} />
    </div>
  );
}
