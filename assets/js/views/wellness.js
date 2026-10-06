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
import { breathingState } from "../breathing.js";

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
      emptyTitle: "Nessun pasto registrato oggi",
      emptyText: "Aggiungi un pasto per raccontare la tua giornata.",
      resources: [
        [
          "guida-alimentazione",
          "chart-pie",
          "Mangia con equilibrio",
          "Esplora il metodo del piatto",
        ],
        [
          "ricette",
          "book-open",
          "Ricette e benessere",
          "Tre idee da personalizzare",
        ],
        [
          "ricerca-alimento",
          "magnifying-glass",
          "Cerca un alimento",
          "Catalogo locale e ricerche recenti",
        ],
        [
          "mercato",
          "archive-box",
          "Mercato del bosco",
          "Conserva gli ingredienti nella dispensa",
        ],
        ["giochi", "sparkles", "Gioca e impara", "Piatto, Frigo Sano e quiz"],
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
      emptyTitle: "Nessuna attività registrata oggi",
      emptyText: "Registra il movimento che hai fatto oggi, al tuo ritmo.",
      resources: [
        [
          "dettaglio-attivita",
          "chart-bar",
          "Dettaglio attività",
          "La settimana dei tuoi minuti registrati",
        ],
        [
          "diario-attivita",
          "calendar-days",
          "Diario attività fisica",
          "Ritrova e correggi le tue attività",
        ],
        [
          "risveglio",
          "sun",
          "Risveglio con Pigna",
          "Scegli i gesti della tua routine",
        ],
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
      emptyTitle: "Nessun sonno registrato oggi",
      emptyText: "Racconta il tuo riposo con ore e sensazioni al risveglio.",
      resources: [
        [
          "luce-blu",
          "moon",
          "La tua routine serale",
          "Gesti e promemoria interni al sito",
        ],
        [
          "meditazione",
          "heart",
          "Meditazione e mindfulness",
          "Tre sessioni con timer e guida scritta",
        ],
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
  const add = `<button class="btn btn-primary min-h-11" data-action="open-entry" data-type="${c.type}">${icon("plus")}${c.action}</button>`;
  const emptyState = state.entries.length
    ? {
        title: c.emptyTitle,
        text: c.emptyText + " Le altre date restano nel diario.",
        action: link("diario", "Esplora il diario"),
      }
    : { title: c.emptyTitle, text: c.emptyText };
  const body = `${titleRow(c.listTitle, add)}${kind === "attivita" ? `<div><p class="mb-2 text-sm text-base-content/85">${movement} di ${state.goals.movement} minuti scelti da te</p><progress class="progress progress-primary w-full" value="${Math.min(movement, state.goals.movement)}" max="${state.goals.movement}" aria-label="Obiettivo di movimento"></progress></div>` : ""}${entryList(entries, emptyState)}${kind === "sonno" ? `<p class="text-xs text-base-content/85">Il tuo obiettivo personale di riposo: ${state.goals.sleep} ore. Puoi modificarlo nel profilo.</p>` : ""}${kind === "alimentazione" ? `<div class="divider my-1"></div><h3>Un sorso alla volta</h3><div class="join self-start"><button class="btn btn-outline btn-square min-h-11 min-w-11 join-item" data-action="water-minus" aria-label="Rimuovi un bicchiere" ${water ? "" : "disabled"}>${icon("minus")}</button><input class="input min-h-11 border-secondary/75 placeholder:text-base-content/85 join-item min-w-0 w-32 text-center text-base" readonly value="${water} / ${state.goals.water}" aria-label="Bicchieri d’acqua registrati, su ${state.goals.water}"><button class="btn btn-outline btn-square min-h-11 min-w-11 join-item" data-action="water-plus" aria-label="Aggiungi un bicchiere">${icon("plus")}</button></div><p class="text-xs text-base-content/85">Bicchieri d’acqua registrati · obiettivo personale modificabile nel profilo.</p>` : ""}`;
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
  return `${heading(c.title, c.desc)}${card("", `<div><h2>${c.intro}</h2><p class="mt-2 max-w-[72ch] text-sm text-base-content/85">${c.body}</p></div>`, "", wellnessPalette[kind].surface, "", kind)}<div class="mt-6 grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", body)}<aside class="grid gap-6">${card("Esplora e impara", resourceMenu(c.resources.map(([r, s, t, d]) => [r === "quiz" ? "impara/" + kind : r, s, t, d])))}${card(tipTitle, `<p class="text-sm text-base-content/85">${tip}</p>`, kind === "alimentazione" ? link("informazioni", "Scopri le fonti") : "", "bg-secondary/5")}</aside></div>`;
}

export function stress({
  timer,
  breathing = { enabled: true, reduced: false },
}) {
  const guide = breathingState(timer);
  const controls = `<div class="grid gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><div class="font-serif text-3xl tabular-nums" id="timer-time" aria-label="Tempo rimanente">${formatTime(guide.remaining)}</div><div class="join">${[60, 180, 300].map((t) => `<button class="btn btn-outline btn-sm min-h-11 join-item px-3 ${timer.duration === t ? "btn-primary btn-active" : ""}" data-action="timer-duration" data-duration="${t}" aria-pressed="${timer.duration === t}" ${timer.started ? "disabled" : ""}>${t / 60} min</button>`).join("")}</div></div><div class="card-actions justify-center"><button class="btn btn-primary min-h-11" id="timer-button" data-action="timer-toggle">${icon(timer.running ? "pause" : "play")}${timer.running ? "Pausa" : timer.started ? "Riprendi" : "Inizia la pausa"}</button><button class="btn btn-outline btn-square size-11" data-action="timer-reset" aria-label="Ricomincia la respirazione">${icon("arrow-path")}</button></div></div>`;
  const visual = `<div class="grid justify-items-center gap-3 py-2" data-breathing><div class="radial-progress bg-primary/5 text-primary [--size:13rem] [--thickness:3px] sm:[--size:14rem]" id="breathing-progress" style="--value:${guide.progress}" role="progressbar" aria-label="Avanzamento della pausa" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${guide.progress}" aria-valuetext="${guide.progress}% della pausa"><span id="breathing-progress-text" class="sr-only">${guide.progress}%</span><div class="avatar" data-breathing-core><div class="w-36 rounded-full bg-primary/15 sm:w-40"><img src="assets/images/pigna.png" alt="" width="512" height="512" class="object-contain p-5"></div></div></div><div class="text-center"><h3 id="breathing-phase" class="text-2xl" role="status" aria-live="polite" aria-atomic="true">${guide.phase}</h3><p id="breathing-cue" class="mt-1 min-h-6 text-xs text-base-content/85">${guide.cue}</p></div></div>`;
  const session = `<div class="grid gap-5"><div class="sm:order-2">${controls}</div><p class="text-center text-sm text-base-content/85 sm:order-0">Segui il ritmo solo se ti è comodo, senza trattenere il respiro.</p><div class="sm:order-1">${visual}</div><label class="label min-h-11 justify-center gap-3 text-sm text-base-content sm:order-3"><input id="breathing-motion" type="checkbox" class="toggle toggle-primary toggle-sm" ${breathing.enabled ? "checked" : ""} ${breathing.reduced ? "disabled" : ""} ${breathing.reduced ? 'aria-describedby="breathing-motion-note"' : ""}>Animazione</label><p id="breathing-motion-note" class="text-center text-xs text-base-content/85 sm:order-4" ${breathing.reduced ? "" : "hidden"}>Movimento ridotto attivo sul dispositivo.</p><p class="text-center text-xs text-base-content/85 sm:order-5">Completa la pausa per registrarla nel diario. +15 foglie una volta al giorno.</p></div>`;
  const tips = `${resourceMenu([
    [
      "meditazione",
      "heart",
      "Meditazione e mindfulness",
      "Tre sessioni e spunti scritti",
    ],
    ["benessere", "moon", "Benessere e riposo", "Pause e routine della sera"],
  ])}<div><h3>Ascolta il tuo corpo</h3><p class="mt-2 text-sm text-base-content/85">Se senti fastidio o capogiri, fermati e torna al tuo respiro naturale.</p></div><div class="divider my-0"></div><div><h3>Non occorre fare di più</h3><p class="mt-2 text-sm text-base-content/85">Anche un minuto può essere un’occasione per interrompere la fretta e osservare come ti senti.</p></div>${resourceMenu([["impara/stress", "book-open", "Gioca e impara", "3 domande sul benessere"]])}`;
  return `${heading("Un momento tutto per te.", "Fermati, respira, riparti al tuo ritmo.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("Respira con Pigna", session)}${card("", `<div><h2>Lascia un po’ di spazio alla calma</h2><p class="mt-2 text-sm text-base-content/85">Una pausa breve e un respiro confortevole. Puoi tenere gli occhi aperti e interrompere quando vuoi.</p></div>`, "", `${wellnessPalette.stress.surface} @4xl:order-first @4xl:col-span-2`, "", "stress")}<aside class="grid gap-6">${card("Piccoli spazi di benessere", tips)}<aside class="card card-side bg-accent/20"><figure class="pl-5"><img src="assets/images/pigna.png" alt="" width="60" height="70" class="h-20 w-16 object-contain"></figure><div class="card-body p-5"><h3 class="card-title font-serif text-lg font-medium">Qui non c’è fretta.</h3><p class="text-sm text-base-content/85">Questo momento è soltanto tuo.</p></div></aside></aside></div>`;
}

export function diary({ state, ui }) {
  const { date: diaryDate, filter: diaryFilter } = ui.diary;
  const entriesInDay = dayEntries(state, diaryDate);
  const entries = entriesInDay.filter(
    (e) => diaryFilter === "all" || e.type === diaryFilter,
  );
  const selectedDay =
    diaryDate === localDate()
      ? "oggi"
      : "il " +
        new Intl.DateTimeFormat("it-IT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(diaryDate + "T12:00:00"));
  const emptyState =
    !state.entries.length && diaryFilter === "all" && diaryDate === localDate()
      ? {}
      : {
          title:
            diaryFilter === "all"
              ? `Nessuna attività registrata ${selectedDay}`
              : `Nessuna registrazione di ${{ meal: "pasti", movement: "attività fisica", sleep: "sonno", mindful: "respirazione", water: "acqua" }[diaryFilter]} ${selectedDay}`,
          text: entriesInDay.length
            ? "In questo giorno ci sono altre attività. Togli il filtro per ritrovarle."
            : "Puoi aggiungere un gesto al giorno selezionato o usare il calendario per esplorare le altre date.",
          action: `<div class="flex flex-wrap justify-center gap-2">${diaryFilter !== "all" ? '<button class="btn btn-outline min-h-11" data-action="diary-clear-filter">Mostra tutte le attività</button>' : ""}${diaryDate !== localDate() ? '<button class="btn btn-ghost min-h-11" data-action="diary-today">Torna a oggi</button>' : ""}</div>`,
        };
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
  return `${heading("Il tuo giorno, un gesto alla volta.", "Ritrova le attività e le sensazioni del tuo percorso.", `<button class="btn btn-outline min-h-11" data-action="export-csv">${icon("arrow-down-tray")}Esporta diario</button>`)}${card(
    "",
    `${illustratedTitle("Il mio diario", "diario")}${filters}<div class="flex flex-wrap items-center gap-2"><button class="btn btn-outline btn-square size-11" data-action="diary-day" data-offset="-1" aria-label="Giorno precedente">${icon("arrow-left")}</button><button class="btn btn-outline min-h-11" data-action="diary-today" ${diaryDate === localDate() ? "disabled" : ""}>Oggi</button><button class="btn btn-outline btn-square size-11" data-action="diary-day" data-offset="1" aria-label="Giorno successivo" ${diaryDate >= localDate() ? "disabled" : ""}>${icon("arrow-right")}</button><span class="text-xs text-base-content/85">${entries.length} ${entries.length === 1 ? "registrazione" : "registrazioni"} nel giorno selezionato</span></div>${entryList(entries, emptyState)}<h3>Aggiungi al tuo giorno</h3>`,
    `${[
      ["meal", "chart-pie", "Un pasto"],
      ["movement", "bolt", "Movimento"],
      ["sleep", "moon", "Sonno"],
      ["water", "beaker", "Acqua"],
    ]
      .map(
        ([type, sym, label]) =>
          `<button class="btn btn-outline min-h-11" data-action="open-entry" data-type="${type}">${icon(sym)}${label}</button>`,
      )
      .join(
        "",
      )}<a href="#stress" class="btn btn-outline min-h-11">${icon("face-smile")}Una pausa</a>`,
  )} `;
}
