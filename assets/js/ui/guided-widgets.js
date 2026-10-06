import { formatTime } from "../timer.js";
import { icon, esc, avatar } from "./components.js";

export const practiceButton = (
  kind,
  action,
  label,
  { primary = false, disabled = false, mode = "", symbol = "" } = {},
) =>
  `<button type="button" class="btn ${primary ? "btn-primary" : "btn-outline"} h-auto min-h-11 whitespace-normal" data-action="practice-${action}" data-practice="${kind}" ${mode ? `data-mode="${mode}"` : ""} ${disabled ? "disabled" : ""}>${symbol ? icon(symbol) : ""}${label}</button>`;

export function practiceSteps(practice) {
  const phases = ["choose", "prepare", "active", "review"],
    position =
      practice.phase === "complete" ? 3 : phases.indexOf(practice.phase);
  return `<ul class="steps steps-horizontal w-full text-xs" role="list" aria-label="Passaggi della routine">${["Scegli", "Preparati", "Pratica", "Riepilogo"].map((label, index) => `<li class="step min-w-0${index <= position ? " step-primary" : ""}" ${index === position ? 'aria-current="step"' : ""}>${label}${index < position || practice.phase === "complete" ? '<span class="sr-only"> · completato</span>' : ""}</li>`).join("")}</ul>`;
}

export function gestureList(ids, items, completed = null) {
  return `<ul class="list">${ids
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean)
    .map(
      (item) =>
        `<li class="list-row items-start px-0">${avatar(icon(item.icon), "bg-base-200")}<div class="min-w-0"><strong class="block text-sm font-semibold">${esc(item.label)}</strong><p class="mt-1 text-sm text-base-content/90">${completed ? (completed.includes(item.id) ? "Gesto fatto" : "Gesto saltato") : esc(item.description)}</p></div>${completed ? icon(completed.includes(item.id) ? "check" : "arrow-right") : ""}</li>`,
    )
    .join("")}</ul>`;
}

export function practiceCurrent(kind, practice, items) {
  const current = items.find(
    (item) => item.id === practice.ids[practice.index],
  );
  if (!current) return "";
  return `${practiceSteps(practice)}<div class="grid gap-4 py-2"><div id="practice-current" tabindex="-1" role="status" aria-live="polite" aria-atomic="true"><h3 class="text-2xl">${practice.paused ? "La tua routine è in pausa" : esc(current.label)}</h3><p class="mt-2 text-sm text-base-content/90">Gesto ${practice.index + 1} di ${practice.ids.length}</p><p class="mt-3 max-w-[72ch] text-base leading-relaxed">${esc(practice.paused ? current.pause : current.cue || current.description)}</p></div><p class="text-sm text-base-content/90">${practice.paused ? "Il gesto resta qui. Riprendi quando vuoi." : "Decidi tu quando passare oltre. Puoi anche saltare questo gesto."}</p></div><div class="card-actions">${practice.paused ? practiceButton(kind, "toggle", "Riprendi", { primary: true, symbol: "play" }) : practiceButton(kind, "next", practice.index + 1 === practice.ids.length ? "Fatto, apri il riepilogo" : "Fatto, continua", { primary: true, symbol: "check" })}${practice.paused ? "" : practiceButton(kind, "skip", "Salta questo gesto")}${practice.paused ? "" : practiceButton(kind, "toggle", "Metti in pausa", { symbol: "pause" })}${practiceButton(kind, "back", "Indietro", { symbol: "arrow-left" })}</div>`;
}

export function pauseSummary(summary) {
  if (!summary) return "";
  return `<div class="alert alert-soft alert-info alert-vertical sm:alert-horizontal" role="note" data-pause-summary-route="${esc(summary.route.replace(/^#/, ""))}">${icon(summary.running ? "play" : "pause")}<div class="min-w-0"><strong>${esc(summary.title)} · ${summary.running ? "in corso" : "in pausa"}</strong><p class="mt-1 text-sm"><span id="pause-summary-time" role="timer" aria-live="off" class="tabular-nums">${formatTime(Math.max(0, summary.remaining))}</span> rimanenti. ${summary.running ? "Il tempo continua mentre navighi nel sito." : "Puoi ritrovare lo stesso punto."}</p></div><a class="btn btn-outline h-auto min-h-11 whitespace-normal" href="#${esc(summary.route.replace(/^#/, ""))}">${summary.running ? "Apri la pausa" : "Riprendi la pausa"}${icon("arrow-right")}</a></div>`;
}

export function pauseOutcome(outcome, title, key = "") {
  if (!outcome) return "";
  const minutes = Number(outcome.minutes),
    duration = `${minutes} ${minutes === 1 ? "minuto" : "minuti"}`,
    description = outcome.blocked
      ? `Tempo dedicato: ${duration}. La pausa è completata, ma non è stata registrata. Recupera il percorso dal profilo, poi prova a registrarla.`
      : outcome.entryMissing
        ? `Tempo dedicato: ${duration}. La registrazione è stata rimossa dal diario.`
        : outcome.saved === false
          ? `Tempo registrato in questa sessione: ${duration}. Il salvataggio nel browser non è riuscito. Esporta una copia per conservarlo.`
          : `${duration} nel diario. Registrazione salvata in questo browser.`,
    actions = outcome.blocked
      ? `<button type="button" class="btn btn-outline h-auto min-h-11 whitespace-normal" data-action="pause-save" data-id="${esc(key)}">${icon("check")}Prova a registrare la pausa</button><a class="btn btn-ghost min-h-11" href="#profilo">Apri il profilo${icon("arrow-right")}</a>`
      : outcome.entryMissing
        ? `<a class="btn btn-outline min-h-11" href="#diario">Apri il diario${icon("arrow-right")}</a>`
        : `${outcome.entryId ? `<button type="button" class="btn btn-outline h-auto min-h-11 whitespace-normal" data-action="open-saved-day" data-date="${esc(outcome.date)}" data-entry-id="${esc(outcome.entryId)}">Apri il giorno registrato${icon("arrow-right")}</button>` : `<a class="btn btn-outline min-h-11" href="#diario">Apri il diario${icon("arrow-right")}</a>`}${outcome.saved === false ? `<button type="button" class="btn btn-outline min-h-11" data-action="export-json">${icon("arrow-down-tray")}Esporta una copia</button>` : ""}`,
    reward = outcome.points
      ? outcome.entryMissing
        ? ` ${outcome.points} foglie già raccolte restano nel tuo percorso.`
        : ` +${outcome.points} foglie.`
      : "",
    skin = outcome.blocked
      ? "alert-warning"
      : outcome.entryMissing
        ? "alert-info"
        : outcome.saved === false
          ? "alert-warning"
          : "alert-success";
  return `<div class="alert alert-soft ${skin} alert-vertical sm:alert-horizontal" role="status">${icon("check")}<div class="min-w-0"><strong>${esc(title)} completata</strong><p class="mt-1 text-sm">${description}${reward}</p></div></div><div class="card-actions">${actions}</div>`;
}
