import { localDate, totalPoints, availablePoints } from "../../data.js";
import { field, icon, esc, stats } from "./components.js";

export const dialogHeading = (title) =>
  `<div class="mb-4 flex items-start justify-between gap-3"><h2 id="dialog-title">${title}</h2><button class="btn btn-ghost btn-circle shrink-0" data-action="close-dialog" aria-label="Chiudi">${icon("x-mark")}</button></div>`;
const inputClass =
  "input border-secondary/75 placeholder:text-base-content/85 w-full";
const select = (name, options, value) =>
  `<select class="select border-secondary/75 w-full" name="${name}">${[...new Set([...options, ...(value && !options.includes(value) ? [value] : [])])].map((option) => `<option ${option === value ? "selected" : ""}>${esc(option)}</option>`).join("")}</select>`;

export function entryDialog(type, date, entry = null) {
  const title = entry
    ? "Modifica la registrazione"
    : {
        meal: "Racconta un pasto",
        movement: "Il tuo momento di movimento",
        sleep: "Come hai dormito?",
        water: "Un bicchiere al tuo giorno",
      }[type];
  const value = entry || {};
  let fields = "";
  if (type === "meal")
    fields = `${field("Quale pasto?", select("meal", ["Colazione", "Pranzo", "Cena", "Spuntino"], value.meal || "Pranzo"))}${field("Cosa hai mangiato?", `<input class="${inputClass}" name="label" value="${esc(value.label)}" placeholder="Es. riso, broccoli e tofu" maxlength="160" required autofocus>`)}`;
  if (type === "movement")
    fields = `${field("La tua attività", select("label", ["Camminata", "Bicicletta", "Allungamento", "Nuoto", "Altra attività"], value.label || "Camminata"))}${field("Durata (minuti)", `<input class="${inputClass}" name="minutes" type="number" value="${esc(value.minutes ?? 20)}" min="0.1" max="600" step="any" required autofocus>`)}`;
  if (type === "sleep")
    fields = `${field("Ore di sonno", `<input class="${inputClass}" name="hours" type="number" value="${esc(value.hours ?? 7.5)}" min="0.5" max="24" step="any" required autofocus>`)}${field("Come ti senti al risveglio?", select("quality", ["Riposo piacevole", "Abbastanza riposato", "Ancora stanco"], value.quality || "Riposo piacevole"))}`;
  if (type === "mindful")
    fields = `${field("Durata della pausa (minuti)", `<input class="${inputClass}" name="minutes" type="number" value="${esc(value.minutes)}" min="0.1" max="600" step="any" required autofocus>`)}<input type="hidden" name="label" value="${esc(value.label || "Pausa di respirazione")}">`;
  return `${dialogHeading(title)}<form id="entry-form" data-type="${type}" ${entry ? `data-id="${esc(entry.id)}"` : ""}><fieldset class="fieldset gap-4"><legend class="fieldset-legend sr-only">Dettagli della registrazione</legend>${fields}${field("Giorno", `<input type="date" class="${inputClass}" name="date" value="${esc(entry?.date || date)}" max="${localDate()}" required>`)}${field("Una nota per te (facoltativa)", `<textarea class="textarea border-secondary/75 placeholder:text-base-content/85 min-h-20 w-full" name="notes" maxlength="300" placeholder="Come è andata?">${esc(value.notes)}</textarea>`)}<p class="text-xs text-base-content/85">${entry ? "Le modifiche aggiornano il diario e i progressi. Le foglie già raccolte restano invariate." : "Salvato solo nel tuo browser. Le missioni assegnano foglie una volta al giorno."}</p></fieldset><p class="alert alert-error alert-soft mt-4 empty:hidden" id="entry-error" role="alert"></p><div class="modal-action"><button type="button" class="btn btn-ghost" data-action="close-dialog">Annulla</button><button class="btn btn-primary" type="submit">${icon("check")}${entry ? "Salva le modifiche" : "Salva nel diario"}</button></div></form>`;
}

export function backupDialog(state, filename) {
  return `${dialogHeading("Ripristinare questa copia?")}<p class="mb-4 break-words text-sm">${esc(filename)} · Profilo: <strong>${esc(state.name || "Senza nome")}</strong></p>${stats(
    [
      [state.entries.length, "registrazioni"],
      [totalPoints(state), "foglie raccolte"],
      [availablePoints(state), "foglie disponibili"],
    ],
  )}<div class="alert alert-warning alert-soft mt-4 text-warning-content" role="note">${icon("information-circle")}<span>La copia sostituirà il percorso presente in questo browser, inclusi chat, dispensa e messaggi della demo. Puoi esportare i dati attuali prima di continuare.</span></div><div class="modal-action flex-wrap"><button class="btn btn-outline" data-action="export-json">Esporta i dati attuali</button><button class="btn btn-primary" data-action="restore-backup">${icon("arrow-up-tray")}Ripristina questa copia</button><button class="btn btn-ghost" data-action="close-dialog">Annulla</button></div>`;
}
