// Reglas del cotizador de Plan Canje, tal como las definió el dueño del
// negocio (todavía se van a ir sumando/ajustando con el tiempo):
//
// - Batería por debajo de 89%: -40usd.
// - Con caja original: +10usd.
// - Detalles estéticos (marco, tapa trasera, cámara con manchas, pantalla
//   con rayón leve): con que haya UNO solo ya se descuentan 45usd fijos —
//   no se acumula por tener varios a la vez.
// - Reparación o cambio de algún componente: -20usd.
// - Garantía vigente: +20usd.
// - Comprado nuevo: no afecta el precio (solo se guarda como dato).
// - Si hay alguna rotura (vidrio, pantalla, etc.) o algún componente no
//   funciona / funciona mal: no se cotiza automático, pasa a revisión
//   técnica en persona.
const LOW_BATTERY_THRESHOLD = 89;
const LOW_BATTERY_DEDUCTION = 40;
const ORIGINAL_BOX_BONUS = 10;
const COSMETIC_DEDUCTION = 45;
const REPAIRS_DEDUCTION = 20;
const WARRANTY_BONUS = 20;

export type TradeInQuoteInput = {
  batteryHealth: number;
  hasOriginalBox: boolean;
  hasFrameDetail: boolean;
  hasBackDetail: boolean;
  hasCameraSmudge: boolean;
  hasScreenScratch: boolean;
  hasRepairs: boolean;
  hasWarranty: boolean;
  hasBreakage: boolean;
  hasFunctionalIssues: boolean;
};

export type TradeInQuoteResult =
  | { needsInPersonReview: true; priceUsd: null; reasons: string[] }
  | { needsInPersonReview: false; priceUsd: number | null; reasons: string[] };

export function calculateTradeInQuote(
  input: TradeInQuoteInput,
  basePriceUsd: number | null,
): TradeInQuoteResult {
  if (input.hasBreakage || input.hasFunctionalIssues) {
    return {
      needsInPersonReview: true,
      priceUsd: null,
      reasons: ["Tiene roturas o algún problema de funcionamiento: requiere evaluación técnica."],
    };
  }

  if (basePriceUsd === null) {
    return {
      needsInPersonReview: false,
      priceUsd: null,
      reasons: ["Todavía no hay un precio de referencia cargado para ese modelo."],
    };
  }

  const reasons: string[] = [`Base: USD ${basePriceUsd}`];
  let price = basePriceUsd;

  if (input.batteryHealth < LOW_BATTERY_THRESHOLD) {
    price -= LOW_BATTERY_DEDUCTION;
    reasons.push(`Batería por debajo de ${LOW_BATTERY_THRESHOLD}%: -USD ${LOW_BATTERY_DEDUCTION}`);
  }

  if (input.hasOriginalBox) {
    price += ORIGINAL_BOX_BONUS;
    reasons.push(`Con caja original: +USD ${ORIGINAL_BOX_BONUS}`);
  }

  const hasCosmeticDetail =
    input.hasFrameDetail || input.hasBackDetail || input.hasCameraSmudge || input.hasScreenScratch;
  if (hasCosmeticDetail) {
    price -= COSMETIC_DEDUCTION;
    reasons.push(`Detalles estéticos: -USD ${COSMETIC_DEDUCTION}`);
  }

  if (input.hasRepairs) {
    price -= REPAIRS_DEDUCTION;
    reasons.push(`Reparación o cambio de componente: -USD ${REPAIRS_DEDUCTION}`);
  }

  if (input.hasWarranty) {
    price += WARRANTY_BONUS;
    reasons.push(`Garantía vigente: +USD ${WARRANTY_BONUS}`);
  }

  price = Math.max(price, 0);

  return { needsInPersonReview: false, priceUsd: price, reasons };
}
