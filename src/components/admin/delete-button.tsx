"use client";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("¿Seguro que querés eliminarlo? Esta acción no se puede deshacer.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-red-500 hover:underline">
        Eliminar
      </button>
    </form>
  );
}
