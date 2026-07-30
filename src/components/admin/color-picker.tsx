"use client";

import { useEffect, useRef, useState } from "react";
import { Pipette, X } from "lucide-react";

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Overlay con la primera foto del producto pintada en un <canvas>: clickear
// un punto lee ese pixel y devuelve su color. Se usa <canvas> en vez de la
// API nativa EyeDropper del navegador porque esa no existe en Safari — esto
// funciona en cualquier navegador. crossOrigin="anonymous" + que Supabase
// Storage sirva CORS abierto (ya lo hace) es lo que permite leer los
// pixeles sin que el canvas quede "tainted".
function EyedropperOverlay({
  imageUrl,
  onPick,
  onClose,
}: {
  imageUrl: string;
  onPick: (hex: string) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxSize = 420;
      const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setStatus("ready");
    };
    img.onerror = () => setStatus("error");
    img.src = imageUrl;
  }, [imageUrl]);

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || status !== "ready") return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.min(
      canvas.width - 1,
      Math.round(((event.clientX - rect.left) / rect.width) * canvas.width),
    );
    const y = Math.min(
      canvas.height - 1,
      Math.round(((event.clientY - rect.top) / rect.height) * canvas.height),
    );
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    onPick(rgbToHex(r, g, b));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 fade-in p-4 duration-150"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">Clickeá un punto de la foto para tomar ese color</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="size-4" />
          </button>
        </div>

        {status === "error" ? (
          <p className="py-8 text-sm text-red-500">No se pudo cargar la imagen.</p>
        ) : (
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            className={`rounded-lg border border-zinc-200 ${status === "ready" ? "cursor-crosshair" : "opacity-40"}`}
          />
        )}
        {status === "loading" && <p className="text-xs text-zinc-400">Cargando imagen...</p>}
      </div>
    </div>
  );
}

// Swatch + input hex + botón de tintero (si hay foto disponible). Componente
// controlado: quien lo usa decide qué hacer con el hex elegido (guardarlo en
// el estado del formulario, mandarlo a una Server Action, etc.).
export function ColorPicker({
  value,
  onChange,
  imageUrl,
}: {
  value: string;
  onChange: (hex: string) => void;
  imageUrl?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div className="flex items-center gap-2">
      <span
        className="size-7 shrink-0 rounded-full border border-zinc-300"
        style={{ backgroundColor: isValidHex ? value : "#f4f4f5" }}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#000000"
        className="h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {imageUrl && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <Pipette className="size-3.5" />
          Elegir de la foto
        </button>
      )}
      {pickerOpen && imageUrl && (
        <EyedropperOverlay
          imageUrl={imageUrl}
          onPick={(hex) => {
            onChange(hex);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
