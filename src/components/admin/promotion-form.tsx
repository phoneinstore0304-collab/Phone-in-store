"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImageDirect } from "@/lib/upload-client";
import type { Promotion } from "@/generated/prisma/client";
import type { PromotionFormState } from "@/app/admin/promociones/actions";

// <input type="datetime-local"> necesita "YYYY-MM-DDTHH:mm", no un ISO completo.
function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nowPlusMinutes(minutes: number) {
  return toDatetimeLocal(new Date(Date.now() + minutes * 60_000));
}

// Sube la imagen directo del navegador a Supabase Storage apenas se elige
// (no viaja por el servidor: Vercel corta cualquier request de más de
// 4.5MB, y un banner en buena resolución pasa eso fácil — ver storage.ts).
// Clickear la imagen actual la reemplaza; mientras sube se ve un spinner.
function ImagePicker({
  existingImage,
  onUploadingChange,
}: {
  existingImage?: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(existingImage);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");
    onUploadingChange?.(true);

    uploadImageDirect(file, "promotions")
      .then((url) => {
        setUploadedUrl(url);
        setStatus("idle");
        onUploadingChange?.(false);
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "No se pudo subir la imagen");
        onUploadingChange?.(false);
      });
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="image" value={uploadedUrl} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-48 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 transition-transform duration-150 hover:scale-[1.02] active:scale-95"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-xs text-zinc-400">Elegir imagen</span>
        )}
        {status === "uploading" && (
          <span className="absolute inset-0 flex items-center justify-center bg-zinc-900/40">
            <span className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        )}
        {preview && status !== "uploading" && (
          <span className="absolute inset-0 flex items-center justify-center bg-zinc-900/0 text-xs font-medium text-white opacity-0 transition-all duration-150 group-hover:bg-zinc-900/50 group-hover:opacity-100">
            Cambiar imagen
          </span>
        )}
      </button>
      {status === "error" && <p className="text-xs text-red-500">{errorMessage}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}

export function PromotionForm({
  action,
  promotion,
}: {
  action: (prevState: PromotionFormState, formData: FormData) => Promise<PromotionFormState>;
  promotion?: Promotion;
}) {
  const [state, formAction, pending] = useActionState<PromotionFormState, FormData>(action, {});
  const [imageUploading, setImageUploading] = useState(false);

  // El navegador limpia el <form> después de cada submit (incluso con
  // error), así que remontamos con `key` cuando llega un `state` nuevo para
  // volver a aplicar `defaultValue` con lo que el admin ya había cargado —
  // los campos inválidos vienen vacíos, el resto se mantiene.
  const [formKey, setFormKey] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setFormKey((key) => key + 1);
  }

  const values = state.values;
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={values?.title ?? promotion?.title}
          aria-invalid={Boolean(fieldErrors.title)}
          required
        />
        {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link">Link (a dónde lleva al hacer click)</Label>
        <Input
          id="link"
          name="link"
          defaultValue={values?.link ?? promotion?.link ?? undefined}
          placeholder="/categoria/iphone-usados"
          aria-invalid={Boolean(fieldErrors.link)}
        />
        {fieldErrors.link && <p className="text-xs text-red-500">{fieldErrors.link}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order">Orden (menor número aparece primero)</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={values?.order ?? promotion?.order ?? 0}
          aria-invalid={Boolean(fieldErrors.order)}
          required
        />
        {fieldErrors.order && <p className="text-xs text-red-500">{fieldErrors.order}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeFrom">Activa desde</Label>
          <Input
            id="activeFrom"
            name="activeFrom"
            type="datetime-local"
            // Si ya se intentó guardar una vez, `values` manda tal cual
            // (incluso vacío si ese campo fue el que falló — no lo pisamos
            // con un default, así el admin ve claro que hay que corregirlo).
            // Si es el primer render de una promoción nueva, arranca en el
            // momento actual para que el admin solo tenga que ajustar.
            defaultValue={
              values ? values.activeFrom : promotion ? toDatetimeLocal(promotion.activeFrom) : nowPlusMinutes(0)
            }
            aria-invalid={Boolean(fieldErrors.activeFrom)}
            required
          />
          {fieldErrors.activeFrom && (
            <p className="text-xs text-red-500">{fieldErrors.activeFrom}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="activeTo">Activa hasta</Label>
          <Input
            id="activeTo"
            name="activeTo"
            type="datetime-local"
            // Nueva promoción: 30 min después del inicio por defecto, para
            // que ya quede una ventana activa válida y el admin solo la
            // estire si necesita más tiempo.
            defaultValue={
              values ? values.activeTo : promotion ? toDatetimeLocal(promotion.activeTo) : nowPlusMinutes(30)
            }
            aria-invalid={Boolean(fieldErrors.activeTo)}
            required
          />
          {fieldErrors.activeTo && <p className="text-xs text-red-500">{fieldErrors.activeTo}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Imagen</Label>
        <ImagePicker existingImage={promotion?.image} onUploadingChange={setImageUploading} />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending || imageUploading} className="w-fit">
        {imageUploading
          ? "Subiendo imagen..."
          : pending
            ? "Guardando..."
            : promotion
              ? "Guardar cambios"
              : "Crear promoción"}
      </Button>
    </form>
  );
}
