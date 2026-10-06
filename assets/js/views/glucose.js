import { localDate } from "../../data.js";
import { GLUCOSE_CONTEXTS, GLUCOSE_LIMIT, glucoseReport } from "../glucose.js";
import {
  card,
  empty,
  esc,
  field,
  heading,
  icon,
  illustratedTitle,
  link,
} from "../ui/components.js";

const inputClass =
  "input min-h-11 w-full border-secondary/75 placeholder:text-base-content/90";
const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});
const dayFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const displayDay = (date) => dayFormatter.format(new Date(`${date}T12:00:00Z`));
const currentTime = () =>
  new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

function readingList(readings, hasOlderRecords) {
  if (!readings.length)
    return empty(
      hasOlderRecords
        ? "Nessuna misurazione in questo periodo"
        : "La tua prima misurazione troverà posto qui",
      hasOlderRecords
        ? "Scegli Tutte le misurazioni per ritrovare le date precedenti, correggerle o esportarle."
        : "Se hai una misurazione da conservare, inserisci il valore riportato dal tuo strumento, la data e l’ora.",
    );

  return `<ul class="list">${readings
    .map((reading) => {
      const label = `${displayDay(reading.date)}, ore ${reading.time}`;
      return `<li class="list-row grid-cols-[1fr_auto] items-start px-0"><div class="list-col-grow min-w-0"><p class="font-semibold tabular-nums">${numberFormatter.format(reading.value)} <span class="text-sm font-normal">mg/dL</span></p><time class="mt-1 block text-xs tabular-nums text-base-content/90" datetime="${reading.date}T${reading.time}">${esc(label)}</time><p class="mt-2 break-words text-sm [overflow-wrap:anywhere]">${esc(reading.context) || "Contesto non indicato"}</p>${reading.notes ? `<p class="mt-2 whitespace-pre-wrap break-words text-xs text-base-content/90 [overflow-wrap:anywhere]">${esc(reading.notes)}</p>` : ""}</div><div class="flex flex-col sm:flex-row"><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="glucose-edit" data-id="${esc(reading.id)}" aria-label="Modifica la misurazione del ${esc(label)}">${icon("pencil-square")}</button><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="glucose-delete" data-id="${esc(reading.id)}" aria-label="Elimina la misurazione del ${esc(label)}">${icon("trash")}</button></div></li>`;
    })
    .join("")}</ul>`;
}

export function glucose({ state, ui }) {
  const settings = ui.glucose || {},
    today = localDate(),
    readings = state.glucoseReadings || [],
    report = glucoseReport(readings, settings.period, today),
    editingId =
      typeof settings.editing === "object"
        ? settings.editing?.id
        : settings.editing,
    editing = readings.find((reading) => reading.id === editingId),
    formValue = {
      ...(editing || {
        date: today,
        time: currentTime(),
        value: "",
        context: "",
        notes: "",
      }),
      ...(settings.draft || {}),
    };
  const atLimit = readings.length >= GLUCOSE_LIMIT;
  const capacity = `<p id="glucose-capacity" class="text-xs text-base-content/90">${readings.length} di ${GLUCOSE_LIMIT} misurazioni conservate in questo browser.</p>${atLimit && !editing ? `<div class="alert alert-warning alert-soft text-warning-content" role="note">${icon("information-circle")}<div>Il registro è pieno. Per aggiungere una misurazione, esporta una copia e rimuovi una voce dallo storico. Puoi ancora correggere le misurazioni presenti.<a class="link mt-2 block" href="#profilo">Gestisci il backup dei dati</a></div></div>` : ""}`;

  const form = `<form id="glucose-form" class="grid gap-4" aria-describedby="glucose-capacity"><p data-draft-status class="text-sm text-base-content/90" hidden>Bozza ripresa. La misurazione è ancora da salvare.</p>${capacity}<fieldset class="fieldset gap-4"><legend class="fieldset-legend font-serif text-xl font-medium">${editing ? "Correggi la misurazione" : "Aggiungi una misurazione"}</legend><div class="grid gap-4 sm:grid-cols-2">${field("Data", `<input id="glucose-date" class="${inputClass}" type="date" name="date" aria-describedby="glucose-error" value="${esc(formValue.date)}" max="${today}" required>`)}${field("Ora", `<input id="glucose-time" class="${inputClass}" type="time" name="time" aria-describedby="glucose-error" value="${esc(formValue.time)}" required>`)}</div>${field("Valore del glucosio (mg/dL)", `<input id="glucose-value" class="${inputClass} tabular-nums" type="number" inputmode="decimal" name="value" min="1" max="1000" step="0.1" value="${esc(formValue.value)}" aria-describedby="glucose-value-help glucose-error" required>`)}<p id="glucose-value-help" class="text-xs text-base-content/90">Inserisci il valore del tuo strumento. Il campo accetta da 1 a 1000, con un decimale: sono limiti tecnici, non intervalli di riferimento.</p><details id="glucose-details" class="collapse collapse-arrow bg-base-200" ${settings.detailsOpen ? "open" : ""}><summary class="collapse-title min-h-11 py-3 text-sm font-semibold">Contesto e note (facoltativi)</summary><div class="collapse-content grid gap-4">${field("Contesto (facoltativo)", `<input id="glucose-context" class="${inputClass}" name="context" aria-describedby="glucose-error" value="${esc(formValue.context)}" maxlength="160" list="glucose-contexts" placeholder="Scegli un suggerimento o scrivi tu"><datalist id="glucose-contexts">${GLUCOSE_CONTEXTS.map((context) => `<option value="${esc(context)}"></option>`).join("")}</datalist>`)}${field("Note (facoltative)", `<textarea id="glucose-notes" class="textarea min-h-24 w-full border-secondary/75 placeholder:text-base-content/90" name="notes" aria-describedby="glucose-error" maxlength="300" rows="3" placeholder="Un dettaglio da ricordare">${esc(formValue.notes)}</textarea>`)}</div></details></fieldset><p id="glucose-error" class="text-sm text-error" role="alert" tabindex="-1" hidden></p><div class="card-actions flex-wrap gap-3"><button class="btn btn-primary min-h-11" type="submit" aria-describedby="glucose-capacity" ${atLimit && !editing ? "disabled" : ""}>${icon(editing ? "check" : "plus")}${editing ? "Salva le modifiche" : "Salva la misurazione"}</button>${editing ? '<button class="btn btn-ghost min-h-11" type="button" data-action="glucose-cancel">Annulla modifica</button>' : ""}</div></form>`;
  const history = `${illustratedTitle("Le tue misurazioni", "diario")}<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">${field("Periodo", `<select id="glucose-period" class="select min-h-11 w-full border-secondary/75" aria-controls="glucose-history"><option value="7" ${report.period === 7 ? "selected" : ""}>Ultimi 7 giorni</option><option value="30" ${report.period === 30 ? "selected" : ""}>Ultimi 30 giorni</option><option value="all" ${report.period === "all" ? "selected" : ""}>Tutte le misurazioni</option></select>`)}<button class="btn btn-outline min-h-11" data-action="glucose-export" ${report.count ? "" : "disabled"}>${icon("arrow-down-tray")}Esporta CSV</button></div><p id="glucose-history-summary" class="text-xs text-base-content/90" role="status" aria-atomic="true">${report.count} ${report.count === 1 ? "misurazione inserita" : "misurazioni inserite"} dal ${esc(displayDay(report.from))} al ${esc(displayDay(report.to))}. Il CSV contiene ${report.period === "all" ? "tutte le misurazioni" : "questo periodo"}.</p><div id="glucose-history">${readingList(report.records, readings.length > 0)}</div>${link("profilo", "Backup e dati personali", "archive-box")}<p class="text-xs text-base-content/90">Le registrazioni sono inserite a mano e possono essere incomplete. Per interpretare valori, sintomi o fattori di rischio rivolgiti al tuo medico.</p>`;

  return `${heading("Registro del glucosio.", "Conserva le misurazioni che inserisci tu, con data e contesto.", link("percorso", "Il tuo percorso", "arrow-left"))}<div class="alert alert-info alert-soft mb-6" role="note">${icon("information-circle")}<span>Inserimenti manuali, conservati in questo browser. Non è collegato a un sensore CGM.</span></div><div class="mt-6 grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card("", form)}${card("", history)}</div>`;
}
