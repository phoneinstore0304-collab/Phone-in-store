"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TradeInTermsContent } from "@/components/trade-in/trade-in-terms-content";
import { createTradeInRequest } from "@/app/(storefront)/plan-canje/actions";
import type { TradeInInput } from "@/lib/validations/trade-in";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OTHER_MODEL_VALUE = "__other__";

type CatalogEntry = { model: string; storageGb: number };

function comboValue(entry: CatalogEntry) {
  return `${entry.model}|${entry.storageGb}`;
}

type YesNoKey =
  | "hasOriginalBox"
  | "hasRepairs"
  | "hasWarranty"
  | "boughtNew"
  | "hasBreakage"
  | "hasFunctionalIssues";

// null = todavía no contestó — así no arrancamos ninguna pregunta con un
// "No" implícito que el usuario nunca eligió.
type YesNoState = Record<YesNoKey, boolean | null>;

const yesNoQuestions: { key: YesNoKey; label: string; detailKey?: keyof DetailState }[] = [
  { key: "hasOriginalBox", label: "¿Tenés la caja original?" },
  { key: "hasWarranty", label: "¿Tiene garantía vigente?" },
  { key: "boughtNew", label: "¿Lo compraste nuevo?" },
  {
    key: "hasRepairs",
    label: "¿Tuvo alguna reparación o cambio de componente?",
    detailKey: "repairsDetail",
  },
  {
    key: "hasBreakage",
    label: "¿Tiene alguna rotura (vidrio trasero, pantalla, vidrio de cámara, etc.)?",
    detailKey: "breakageDetail",
  },
  {
    key: "hasFunctionalIssues",
    label: "¿Algún componente no funciona o funciona mal (cámara, botones, parlante, etc.)?",
    detailKey: "functionalIssuesDetail",
  },
];

type DetailState = {
  repairsDetail: string;
  breakageDetail: string;
  functionalIssuesDetail: string;
};

type CosmeticKey = "hasFrameDetail" | "hasBackDetail" | "hasCameraSmudge" | "hasScreenScratch";

const cosmeticOptions: { key: CosmeticKey; label: string }[] = [
  { key: "hasFrameDetail", label: "Marco abollado o con rayones" },
  { key: "hasBackDetail", label: "Tapa trasera con rayones o manchas" },
  { key: "hasCameraSmudge", label: "Manchas en el vidrio de la cámara" },
  { key: "hasScreenScratch", label: "Rayón leve en la pantalla" },
];

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(true)}
        className={`h-8 rounded-full border px-4 text-sm font-medium transition-colors ${
          value === true
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input text-foreground/70 hover:bg-muted"
        }`}
      >
        Sí
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
        className={`h-8 rounded-full border px-4 text-sm font-medium transition-colors ${
          value === false
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input text-foreground/70 hover:bg-muted"
        }`}
      >
        No
      </button>
    </div>
  );
}

type SuccessResult = { needsInPersonReview: boolean; priceUsd: number | null };

// Solo el número final, nunca el desglose de qué sumó o restó — si el
// cliente viera qué resta puntos, podría contestar las preguntas
// siguientes acomodando la respuesta para inflar la cotización.
function QuotePanel({
  submitting,
  error,
  result,
}: {
  submitting: boolean;
  error: string | null;
  result: SuccessResult | null;
}) {
  let content: React.ReactNode = (
    <p className="text-sm text-zinc-500">
      Completá el formulario y presioná Aceptar para ver tu cotización estimada acá.
    </p>
  );

  if (submitting) {
    content = <p className="text-sm text-zinc-500">Calculando...</p>;
  } else if (result) {
    if (result.needsInPersonReview) {
      content = (
        <>
          <h3 className="font-display text-xl font-bold text-zinc-900">
            Necesitamos verlo en persona
          </h3>
          <p className="text-sm text-zinc-500">
            Un técnico tiene que evaluarlo antes de poder cotizarlo. Te contactamos para
            coordinar.
          </p>
        </>
      );
    } else if (result.priceUsd !== null) {
      content = (
        <>
          <span className="text-xs text-zinc-400">Cotización estimada</span>
          <span className="font-display text-5xl font-bold text-primary">
            USD {result.priceUsd}
          </span>
          <p className="text-sm text-zinc-500">
            Valor automático y no vinculante, sujeto a inspección física en el local. El precio
            final se confirma en persona.
          </p>
        </>
      );
    } else {
      content = (
        <>
          <h3 className="font-display text-xl font-bold text-zinc-900">¡Listo, lo recibimos!</h3>
          <p className="text-sm text-zinc-500">
            Todavía no tenemos un precio de referencia cargado para ese modelo — te contactamos
            con una cotización a medida.
          </p>
        </>
      );
    }
  }

  return (
    <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-border bg-card p-8 lg:sticky lg:top-10">
      <h2 className="font-display text-xl font-bold text-zinc-900">Tu cotización</h2>
      {content}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </aside>
  );
}

export function TradeInForm({
  initialName = "",
  initialEmail = "",
  catalog,
  header,
}: {
  initialName?: string;
  initialEmail?: string;
  catalog: CatalogEntry[];
  header: React.ReactNode;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail);

  const [combo, setCombo] = useState("");
  const [otherModel, setOtherModel] = useState("");
  const [otherStorageGb, setOtherStorageGb] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [notes, setNotes] = useState("");

  const [yesNo, setYesNo] = useState<YesNoState>({
    hasOriginalBox: null,
    hasRepairs: null,
    hasWarranty: null,
    boughtNew: null,
    hasBreakage: null,
    hasFunctionalIssues: null,
  });
  const [details, setDetails] = useState<DetailState>({
    repairsDetail: "",
    breakageDetail: "",
    functionalIssuesDetail: "",
  });
  const [cosmetic, setCosmetic] = useState<Record<CosmeticKey, boolean>>({
    hasFrameDetail: false,
    hasBackDetail: false,
    hasCameraSmudge: false,
    hasScreenScratch: false,
  });
  const [cosmeticNotes, setCosmeticNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);

  const [termsOpen, setTermsOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Omit<
    TradeInInput,
    "acceptedTerms"
  > | null>(null);

  const isOther = combo === OTHER_MODEL_VALUE;
  const anyCosmetic = Object.values(cosmetic).some(Boolean);

  // El formulario nunca se manda solo: primero se valida todo y se abre el
  // popup de términos y condiciones. La cotización recién se calcula (y se
  // guarda el pedido) cuando confirma ahí adentro — ver confirmTerms.
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!combo) {
      setError("Elegí el modelo de tu celular.");
      return;
    }

    const model = isOther ? otherModel.trim() : combo.split("|")[0];
    const storageGb = isOther ? Number(otherStorageGb) : Number(combo.split("|")[1]);

    if (isOther && (!model || !storageGb)) {
      setError("Completá el modelo y el almacenamiento.");
      return;
    }

    const unanswered = yesNoQuestions.find((question) => yesNo[question.key] === null);
    if (unanswered) {
      setError(`Falta responder: "${unanswered.label}"`);
      return;
    }

    setPendingPayload({
      fullName,
      phone,
      email,
      model,
      storageGb,
      batteryHealth: Number(batteryHealth),
      hasOriginalBox: yesNo.hasOriginalBox as boolean,
      hasFrameDetail: cosmetic.hasFrameDetail,
      hasBackDetail: cosmetic.hasBackDetail,
      hasCameraSmudge: cosmetic.hasCameraSmudge,
      hasScreenScratch: cosmetic.hasScreenScratch,
      cosmeticNotes,
      hasRepairs: yesNo.hasRepairs as boolean,
      repairsDetail: details.repairsDetail,
      hasWarranty: yesNo.hasWarranty as boolean,
      boughtNew: yesNo.boughtNew as boolean,
      hasBreakage: yesNo.hasBreakage as boolean,
      breakageDetail: details.breakageDetail,
      hasFunctionalIssues: yesNo.hasFunctionalIssues as boolean,
      functionalIssuesDetail: details.functionalIssuesDetail,
      notes,
    });
    setTermsChecked(false);
    setTermsOpen(true);
  }

  async function confirmTerms() {
    if (!pendingPayload) return;

    setTermsOpen(false);
    setSubmitting(true);

    const response = await createTradeInRequest({ ...pendingPayload, acceptedTerms: true });

    if ("error" in response) {
      setError(response.error);
      setSubmitting(false);
      return;
    }

    setResult({ needsInPersonReview: response.needsInPersonReview, priceUsd: response.priceUsd });
    setSubmitting(false);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,42rem)_360px]">
      <div className="flex flex-col gap-8">
        {header}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-zinc-900">Tus datos</h2>
          <p className="text-xs text-zinc-400">
            Opcional, pero sin al menos uno de estos dos no vamos a poder contactarte con la
            cotización.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Nombre y apellido (opcional)</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="11 2345-6789"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-zinc-900">Datos de tu celular 📱</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="combo">Modelo y almacenamiento</Label>
            <select
              id="combo"
              value={combo}
              onChange={(event) => setCombo(event.target.value)}
              required
              className={selectClassName}
            >
              <option value="" disabled>
                Elegir...
              </option>
              {catalog.map((entry) => (
                <option key={comboValue(entry)} value={comboValue(entry)}>
                  {entry.model} · {entry.storageGb} GB
                </option>
              ))}
              <option value={OTHER_MODEL_VALUE}>Mi modelo no está en la lista</option>
            </select>
          </div>

          {isOther && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otherModel">Modelo</Label>
                <Input
                  id="otherModel"
                  value={otherModel}
                  onChange={(event) => setOtherModel(event.target.value)}
                  placeholder="iPhone 12 mini"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="otherStorageGb">Almacenamiento (GB)</Label>
                <Input
                  id="otherStorageGb"
                  type="number"
                  min={1}
                  value={otherStorageGb}
                  onChange={(event) => setOtherStorageGb(event.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="batteryHealth">Estado de batería (%)</Label>
            <Input
              id="batteryHealth"
              type="number"
              min={0}
              max={100}
              value={batteryHealth}
              onChange={(event) => setBatteryHealth(event.target.value)}
              placeholder="85"
              className="max-w-32"
              required
            />
            <p className="text-xs text-zinc-400">Ajustes → Batería → Salud de la batería</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-zinc-900">
            ¿Tiene alguno de estos detalles estéticos? (marcá los que apliquen)
          </span>
          <div className="flex flex-col gap-2.5">
            {cosmeticOptions.map((option) => (
              <label key={option.key} className="flex items-center gap-2.5 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={cosmetic[option.key]}
                  onChange={(event) =>
                    setCosmetic((prev) => ({ ...prev, [option.key]: event.target.checked }))
                  }
                  className="size-4"
                />
                {option.label}
              </label>
            ))}
          </div>
          {anyCosmetic && (
            <textarea
              value={cosmeticNotes}
              onChange={(event) => setCosmeticNotes(event.target.value)}
              rows={2}
              placeholder="Contanos un poco más sobre los detalles..."
              className={textareaClassName}
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          {yesNoQuestions.map((question) => (
            <div key={question.key} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-800">{question.label}</span>
                <YesNoToggle
                  value={yesNo[question.key]}
                  onChange={(value) => setYesNo((prev) => ({ ...prev, [question.key]: value }))}
                />
              </div>
              {question.detailKey && yesNo[question.key] === true && (
                <textarea
                  value={details[question.detailKey]}
                  onChange={(event) =>
                    setDetails((prev) => ({ ...prev, [question.detailKey!]: event.target.value }))
                  }
                  rows={2}
                  placeholder="Contanos un poco más..."
                  className={textareaClassName}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Algo más que quieras contarnos (opcional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className={textareaClassName}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={submitting} className="w-fit">
            {submitting ? "Calculando..." : "Aceptar"}
          </Button>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-xs text-zinc-400 underline-offset-2 hover:underline"
          >
            Ver términos y condiciones
          </button>
        </div>
        </form>
      </div>

      <QuotePanel submitting={submitting} error={error} result={result} />

      <Dialog
        open={termsOpen}
        onOpenChange={(open) => {
          setTermsOpen(open);
          if (!open) setTermsChecked(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Términos y condiciones</DialogTitle>
            <DialogDescription>
              Antes de ver tu cotización, leé y aceptá lo siguiente.
            </DialogDescription>
          </DialogHeader>

          <TradeInTermsContent />

          {pendingPayload && (
            <label className="flex items-start gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(event) => setTermsChecked(event.target.checked)}
                className="mt-0.5 size-4 shrink-0"
              />
              Leí y acepto los términos y condiciones de esta cotización.
            </label>
          )}

          <DialogFooter>
            {pendingPayload ? (
              <Button
                type="button"
                disabled={!termsChecked}
                onClick={confirmTerms}
                className="w-fit"
              >
                Ver mi cotización
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setTermsOpen(false)} className="w-fit">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
