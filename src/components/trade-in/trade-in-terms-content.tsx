// Texto del disclaimer legal del cotizador — ver trade-in-form.tsx para el
// popup que obliga a aceptarlo antes de mostrar la cotización. Borrador
// inicial, no reemplaza una revisión de un abogado.
export function TradeInTermsContent() {
  return (
    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1 text-sm text-zinc-600">
      <p>
        Esta herramienta calcula una cotización <strong>estimada y automática</strong> en base a
        los datos que vos mismo cargás sobre tu equipo (modelo, batería, estado general, etc.).
        No es una tasación hecha por un técnico ni reemplaza una inspección física del
        dispositivo.
      </p>
      <p>
        El valor que te mostramos <strong>no es una oferta de compra vinculante</strong> ni un
        compromiso de pago de Phone in Store — es solo un valor de referencia para que tengas una
        idea antes de acercarte.
      </p>
      <p>
        El precio final se define recién después de revisar el equipo en persona en nuestro
        local, donde verificamos batería, funcionamiento, componentes y estética real. Ese valor
        puede coincidir, ser menor o ser mayor al estimado acá.
      </p>
      <p>
        Si algún dato que cargaste no coincide con el estado real del equipo (batería, roturas,
        reparaciones no informadas, etc.), la cotización estimada pierde validez y se recalcula
        en el local.
      </p>
      <p>
        Phone in Store puede modificar, ajustar o rechazar la cotización estimada luego de la
        revisión presencial, sin que esto genere ninguna obligación de compra para ninguna de las
        partes.
      </p>
      <p>
        Los datos de contacto (nombre, teléfono, email) son opcionales y se usan solo para poder
        comunicarte una cotización o coordinar una revisión, si los dejás.
      </p>
    </div>
  );
}
