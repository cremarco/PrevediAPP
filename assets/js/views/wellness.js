import { localDate, dayEntries } from "../../data.js";
import {
  icon,
  heading,
  titleRow,
  card,
  link,
  resourceMenu,
  entryList,
  illustratedTitle,
} from "../ui/components.js";
import { wellnessPalette } from "../config.js";
import { formatTime } from "../timer.js";

export function wellness({ state }, kind) {
  const configs = {
    alimentazione: {
      title: "Mangia con equilibrio.",
      desc: "Scopri, componi e racconta i tuoi pasti.",
      intro: "Il benessere comincia anche dal piatto",
      body: "Varietà e piccoli gesti: esplora il metodo del piatto e trova le abitudini che fanno per te.",
      type: "meal",
      action: "Aggiungi pasto",
      listTitle: "I pasti di oggi",
      resources: [
        [
          "piatto",
          "chart-pie",
          "Crea il piatto",
          "Un gioco per esplorare le proporzioni",
        ],
        [
          "frigo",
          "archive-box",
          "Il frigo della salute",
          "Organizza la tua dispensa",
        ],
        ["quiz", "book-open", "Gioca e impara", "3 domande sull’alimentazione"],
      ],
    },
    attivita: {
      title: "Trova il tuo ritmo.",
      desc: "Ogni movimento ha il suo valore.",
      intro: "Un passo fuori, un po’ di energia dentro",
      body: "Una passeggiata, un giro in bici, qualche allungamento. Scegli un’attività adatta a te e alle indicazioni del tuo curante.",
      type: "movement",
      action: "Registra attività",
      listTitle: "Il movimento di oggi",
      resources: [
        [
          "quiz",
          "book-open",
          "Muoversi con consapevolezza",
          "Mettiti alla prova con 3 domande",
        ],
      ],
    },
    sonno: {
      title: "Dai spazio al riposo.",
      desc: "Ascolta come ti senti, al risveglio e durante il giorno.",
      intro: "La tua sera, un ritmo più lento",
      body: "Una routine tranquilla può accompagnarti verso il riposo. Il diario ti aiuta a riconoscere le tue abitudini.",
      type: "sleep",
      action: "Registra sonno",
      listTitle: "Il tuo riposo",
      resources: [
        [
          "stress",
          "face-smile",
          "Una pausa prima di dormire",
          "Respira con Pigna",
        ],
        [
          "quiz",
          "book-open",
          "Conosci il tuo sonno",
          "3 domande per riflettere",
        ],
      ],
    },
  };

  const c = configs[kind],
    entries = dayEntries(state).filter((e) => e.type === c.type),
    movement = entries.reduce((n, e) => n + (Number(e.minutes) || 0), 0),
    water = dayEntries(state).filter((e) => e.type === "water").length;
  const add = `<button class="btn btn-primary" data-action="open-entry" data-type="${c.type}">${icon("plus")}${c.action}</button>`;
  const body = `${titleRow(c.listTitle, add)}${kind === "attivita" ? `<div><p class="mb-2 text-sm text-base-content/85">${movement} di ${state.goals.movement} minuti scelti da te</p><progress class="progress progress-primary w-full" value="${Math.min(movement, state.goals.movement)}" max="${state.goals.movement}" aria-label="Obiettivo di movimento"></progress></div>` : ""}${entryList(entries)}${kind === "sonno" ? `<p class="text-xs text-base-content/85">Il tuo obiettivo personale di riposo: ${state.goals.sleep} ore. Puoi modificarlo nel profilo.</p>` : ""}${kind === "alimentazione" ? `<div class="divider my-1"></div><h3>Un sorso alla volta</h3><div class="join self-start"><button class="btn btn-outline btn-square join-item" data-action="water-minus" aria-label="Rimuovi un bicchiere" ${water ? "" : "disabled"}>${icon("minus")}</button><input class="input border-secondary/75 placeholder:text-base-content/85 join-item w-36 text-center text-base" readonly value="${water} / ${state.goals.water}" aria-label="Bicchieri d’acqua registrati, su ${state.goals.water}"><button class="btn btn-outline btn-square join-item" data-action="water-plus" aria-label="Aggiungi un bicchiere">${icon("plus")}</button></div><p class="text-xs text-base-content/85">Bicchieri d’acqua registrati · obiettivo personale modificabile nel profilo.</p>` : ""}`;
  const tipTitle =
    kind === "alimentazione"
      ? "Il metodo del piatto"
      : kind === "attivita"
        ? "Al tuo ritmo, sempre"
        : "Prova un piccolo rituale";
  const tip =
    kind === "alimentazione"
      ? "Metà verdure non amidacee, un quarto proteine, un quarto carboidrati. Un riferimento educativo da adattare alle tue esigenze."
      : kind === "attivita"
        ? "Scegli un obiettivo realistico per te: puoi cambiarlo dal profilo. Anche le pause di movimento fanno parte del tuo diario."
        : "Spegni le notifiche, scegli un’attività tranquilla e ritaglia un momento tutto tuo prima di dormire.";
  return `${heading(c.title, c.desc)}${card("", `<div><h2>${c.intro}</h2><p class="mt-2 max-w-[72ch] text-sm text-base-content/85">${c.body}</p></div>`, "", wellnessPalette[kind].surface, "", kind)}<div class="mt-6 grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", body)}<aside class="grid gap-6">${card("Esplora e impara", resourceMenu(c.resources.map(([r, s, t, d]) => [r === "quiz" ? "quiz/" + kind : r, s, t, d])))}${card(tipTitle, `<p class="text-sm text-base-content/85">${tip}</p>`, kind === "alimentazione" ? link("informazioni", "Scopri le fonti") : "", "bg-secondary/5")}</aside></div>`;
}

export function stress({ timer }) {
  const session = `<p class="text-center text-sm text-base-content/85">Segui il ritmo solo se ti è comodo, senza trattenere il respiro.</p><div class="avatar avatar-placeholder my-5 self-center" data-breathing data-running="${timer.running}"><div class="w-44 rounded-full bg-secondary/15"><span class="flex flex-col items-center gap-3">${icon("face-smile", "size-8")}<strong class="font-normal" id="breathing-phase">${timer.running ? "Inspira" : timer.started ? "In pausa" : "Trova la calma"}</strong></span></div></div><div class="text-center font-serif text-4xl tabular-nums" id="timer-time" aria-label="Tempo rimanente">${formatTime(timer.remaining)}</div><div class="join self-center">${[60, 180, 300].map((t) => `<button class="btn btn-outline join-item ${timer.duration === t ? "btn-primary btn-active" : ""}" data-action="timer-duration" data-duration="${t}" aria-pressed="${timer.duration === t}" ${timer.started ? "disabled" : ""}>${t / 60} min</button>`).join("")}</div><div class="card-actions justify-center"><button class="btn btn-primary" id="timer-button" data-action="timer-toggle">${icon(timer.running ? "pause" : "play")}${timer.running ? "Pausa" : timer.started ? "Riprendi" : "Inizia la pausa"}</button><button class="btn btn-outline btn-square" data-action="timer-reset" aria-label="Ricomincia la respirazione">${icon("arrow-path")}</button></div><p class="text-center text-xs text-base-content/85">Completa la pausa per registrarla nel diario. +15 foglie una volta al giorno.</p>`;
  const tips = `<div><h3>Ascolta il tuo corpo</h3><p class="mt-2 text-sm text-base-content/85">Se senti fastidio o capogiri, fermati e torna al tuo respiro naturale.</p></div><div class="divider my-0"></div><div><h3>Non occorre fare di più</h3><p class="mt-2 text-sm text-base-content/85">Anche un minuto può essere un’occasione per interrompere la fretta e osservare come ti senti.</p></div>${resourceMenu([["quiz/stress", "book-open", "Gioca e impara", "3 domande sul benessere"]])}`;
  return `${heading("Un momento tutto per te.", "Fermati, respira, riparti al tuo ritmo.")}${card("", `<div><h2>Lascia un po’ di spazio alla calma</h2><p class="mt-2 text-sm text-base-content/85">Una pausa breve e un respiro confortevole. Puoi tenere gli occhi aperti e interrompere quando vuoi.</p></div>`, "", wellnessPalette.stress.surface, "", "stress")}<div class="mt-6 grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("Respira con Pigna", session)}<aside class="grid gap-6">${card("Piccoli spazi di benessere", tips)}<aside class="card card-side bg-accent/20"><figure class="pl-5"><img src="assets/images/pigna.png" alt="" width="60" height="70" class="h-20 w-16 object-contain"></figure><div class="card-body p-5"><h3 class="card-title font-serif text-lg font-medium">Qui non c’è fretta.</h3><p class="text-sm text-base-content/85">Questo momento è soltanto tuo.</p></div></aside></aside></div>`;
}

export function diary({ state, ui }) {
  const { date: diaryDate, filter: diaryFilter } = ui.diary;
  const entries = dayEntries(state, diaryDate).filter(
    (e) => diaryFilter === "all" || e.type === diaryFilter,
  );
  const filters = `<div class="grid gap-3 sm:grid-cols-2"><fieldset class="fieldset"><legend class="fieldset-legend">Attività</legend><label class="sr-only" for="diary-filter">Filtra per attività</label><select id="diary-filter" class="select border-secondary/75 w-full">${[
    ["all", "Tutte le attività"],
    ["meal", "Pasti"],
    ["movement", "Movimento"],
    ["sleep", "Sonno"],
    ["mindful", "Respirazione"],
    ["water", "Acqua"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${diaryFilter === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Giorno</legend><label class="sr-only" for="diary-date">Giorno del diario</label><input id="diary-date" type="date" class="input border-secondary/75 placeholder:text-base-content/85 w-full" value="${diaryDate}" max="${localDate()}"></fieldset></div>`;
  return `${heading("Il tuo giorno, un gesto alla volta.", "Ritrova le attività e le sensazioni del tuo percorso.", `<button class="btn btn-outline" data-action="export-csv">${icon("arrow-down-tray")}Esporta diario</button>`)}${card(
    "",
    `${illustratedTitle("Il mio diario", "diario")}${filters}<div class="flex flex-wrap items-center gap-2"><button class="btn btn-outline btn-square min-h-11" data-action="diary-day" data-offset="-1" aria-label="Giorno precedente">${icon("arrow-left")}</button><button class="btn btn-outline min-h-11" data-action="diary-today" ${diaryDate === localDate() ? "disabled" : ""}>Oggi</button><button class="btn btn-outline btn-square min-h-11" data-action="diary-day" data-offset="1" aria-label="Giorno successivo" ${diaryDate >= localDate() ? "disabled" : ""}>${icon("arrow-right")}</button><span class="text-xs text-base-content/85">${entries.length} ${entries.length === 1 ? "registrazione" : "registrazioni"} nel giorno selezionato</span></div>${entryList(entries)}<h3>Aggiungi al tuo giorno</h3>`,
    `${[
      ["meal", "chart-pie", "Un pasto"],
      ["movement", "bolt", "Movimento"],
      ["sleep", "moon", "Sonno"],
      ["water", "beaker", "Acqua"],
    ]
      .map(
        ([type, sym, label]) =>
          `<button class="btn btn-outline" data-action="open-entry" data-type="${type}">${icon(sym)}${label}</button>`,
      )
      .join(
        "",
      )}<a href="#stress" class="btn btn-outline">${icon("face-smile")}Una pausa</a>`,
  )} `;
}
