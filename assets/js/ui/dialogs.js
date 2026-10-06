import { localDate, totalPoints, availablePoints } from "../../data.js";
import { field, icon, esc, stats } from "./components.js";

export const dialogHeading = (title) =>
  `<div class="mb-4 flex items-start justify-between gap-3"><h2 id="dialog-title">${esc(title)}</h2><button type="button" class="btn btn-ghost btn-circle shrink-0" data-action="close-dialog" aria-label="Chiudi">${icon("x-mark")}</button></div>`;
const inputClass =
  "input border-secondary/75 placeholder:text-base-content/90 w-full";
const select = (name, options, value, placeholder = "") =>
  `<select id="entry-${name}" class="select border-secondary/75 w-full" name="${name}" aria-describedby="entry-error" ${placeholder ? "" : "required"}>${placeholder ? `<option value="" ${!value ? "selected" : ""}>${esc(placeholder)}</option>` : ""}${[...new Set([...options, ...(value && !options.includes(value) ? [value] : [])])].map((option) => `<option ${option === value ? "selected" : ""}>${esc(option)}</option>`).join("")}</select>`;

export function entryDialog(type, date, entry = null) {
  const title = entry
    ? "Modifica la registrazione"
    : {
        meal: "Racconta un pasto",
        movement: "Il tuo momento di movimento",
        sleep: "Come hai dormito?",
        water: "Un bicchiere al tuo giorno",
        mindful: "Un momento per te",
      }[type];
  const value = entry || {};
  let fields = "";
  if (type === "meal")
    fields = `${field("Quale pasto?", select("meal", ["Colazione", "Pranzo", "Cena", "Spuntino"], value.meal || "Pranzo"))}${field("Cosa hai mangiato? (obbligatorio)", `<input class="${inputClass}" id="entry-label" name="label" aria-describedby="entry-error" value="${esc(value.label)}" placeholder="Es. riso, broccoli e tofu" maxlength="160" required autofocus>`)}`;
  if (type === "movement")
    fields = `${field("La tua attività", select("label", ["Camminata", "Bicicletta", "Allungamento", "Nuoto", "Altra attività"], value.label || "Camminata"))}${field("Durata (minuti, obbligatoria)", `<input class="${inputClass}" id="entry-minutes" name="minutes" aria-describedby="entry-value-help entry-error" type="number" value="${esc(value.minutes ?? "")}" placeholder="Es. 20" min="0.1" max="600" step="any" required autofocus>`)}`;
  if (type === "sleep")
    fields = `${field("Ore di sonno (obbligatorie)", `<input class="${inputClass}" id="entry-hours" name="hours" aria-describedby="entry-value-help entry-error" type="number" value="${esc(value.hours ?? "")}" placeholder="Es. 7,5" min="0.5" max="24" step="any" required autofocus>`)}${field("Come ti senti al risveglio?", select("quality", ["Riposo piacevole", "Abbastanza riposato", "Ancora stanco"], value.quality || "", "Scegli come ti senti (facoltativo)"))}`;
  if (type === "mindful")
    fields = `${field("Durata della pausa (minuti, obbligatoria)", `<input class="${inputClass}" id="entry-minutes" name="minutes" aria-describedby="entry-value-help entry-error" type="number" value="${esc(value.minutes)}" min="0.1" max="600" step="any" required autofocus>`)}<input type="hidden" name="label" value="${esc(value.label || "Pausa di respirazione")}">`;
  return `${dialogHeading(title)}<form id="entry-form" aria-describedby="entry-help entry-draft-help" data-type="${type}" ${entry ? `data-id="${esc(entry.id)}"` : ""}><p data-draft-status class="mb-3 text-sm text-base-content/90" hidden>Bozza ripresa. La registrazione è ancora da salvare.</p><fieldset class="fieldset gap-4"><legend class="fieldset-legend sr-only">Dettagli della registrazione</legend>${fields}${["movement", "mindful", "sleep"].includes(type) ? `<p id="entry-value-help" class="text-xs text-base-content/90">${type === "sleep" ? "Da mezz’ora a 24 ore." : "Da 0,1 a 600 minuti. Sono ammesse durate con decimali."}</p>` : ""}${field("Giorno (obbligatorio)", `<input type="date" class="${inputClass}" id="entry-date" name="date" aria-describedby="entry-error" value="${esc(entry?.date || date)}" max="${localDate()}" required>`)}${field("Una nota per te (facoltativa)", `<textarea class="textarea border-secondary/75 placeholder:text-base-content/90 min-h-20 w-full" id="entry-notes" name="notes" aria-describedby="entry-error" maxlength="300" placeholder="Come è andata?">${esc(value.notes)}</textarea>`)}<p id="entry-help" class="text-xs text-base-content/90">${entry ? "Le modifiche aggiornano il diario e i progressi. Le foglie già raccolte restano invariate." : "Salvato solo nel tuo browser. Le missioni assegnano foglie una volta al giorno."}</p><p id="entry-draft-help" class="text-xs text-base-content/90">Chiudendo, la bozza resta disponibile in questa scheda.</p></fieldset><p class="alert alert-error alert-soft mt-4 empty:hidden" id="entry-error" role="alert" tabindex="-1"></p><div class="modal-action flex-wrap"><button type="button" class="btn btn-ghost" data-action="close-dialog">Chiudi</button><button type="button" class="btn btn-ghost" data-action="discard-entry-draft">Scarta bozza</button><button class="btn btn-primary" type="submit">${icon("check")}${entry ? "Salva le modifiche" : "Salva nel diario"}</button></div></form>`;
}

export function backupDialog(state, filename) {
  return `${dialogHeading("Ripristinare questa copia?")}<p class="mb-4 break-words text-sm">${esc(filename)} · Profilo: <strong>${esc(state.name || "Senza nome")}</strong></p>${stats(
    [
      [state.entries.length, "attività nel diario"],
      [state.glucoseReadings?.length || 0, "misurazioni manuali"],
      [totalPoints(state), "foglie raccolte"],
      [availablePoints(state), "foglie disponibili"],
    ],
  )}<div id="backup-restore-help" class="alert alert-warning alert-soft mt-4 text-warning-content" role="note">${icon("information-circle")}<span>La copia sostituirà il percorso presente in questo browser, inclusi chat, dispensa e messaggi della demo. Puoi esportare i dati attuali prima di continuare.</span></div><div class="modal-action flex-wrap"><button class="btn btn-outline" data-action="export-json">Esporta i dati attuali</button><button class="btn btn-primary" data-action="restore-backup" aria-describedby="backup-restore-help">${icon("arrow-up-tray")}Ripristina questa copia</button><button class="btn btn-ghost" data-action="close-dialog">Annulla</button></div>`;
}
