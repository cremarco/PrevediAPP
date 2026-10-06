import {
  heading,
  card,
  link,
  entryList,
  illustratedTitle,
  icon,
} from "../ui/components.js";
import { habitReport } from "../insights.js";

export function movementDiary({ state }) {
  const report = habitReport(state, "movement", 7);
  const entries = state.entries.filter(
    (e) => e.type === "movement" && report.dates.includes(e.date),
  );
  return `${heading("Il tuo diario del movimento.", "Ritrova le attività degli ultimi sette giorni.", link("attivita", "Attività fisica", "arrow-left"))}${card("", `${illustratedTitle("Una settimana, al tuo ritmo", "attivita")}<p class="text-sm text-base-content/85">${report.total} minuti registrati in ${report.registeredDays} ${report.registeredDays === 1 ? "giorno" : "giorni"}. Ogni voce resta modificabile.</p>${entryList(entries, { title: "La settimana aspetta il tuo prossimo gesto", text: "Registra il movimento dopo averlo svolto. Le altre date restano nel diario completo.", action: link("diario", "Esplora tutte le date") })}`, `<button class="btn btn-primary min-h-11" data-action="open-entry" data-type="movement">${icon("plus")}Registra attività</button>${link("dettaglio-attivita", "Guarda i dettagli")}`)}`;
}
