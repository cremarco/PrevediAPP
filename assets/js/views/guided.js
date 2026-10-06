import { dayEntries, localDate } from "../../data.js";
import { habitReport } from "../insights.js";
import { formatTime } from "../timer.js";
import {
  exercises,
  sleepRoutine,
  meditations,
  validExerciseIds,
  validRoutineIds,
  validExerciseMinutes,
  safeSession,
} from "../guided-content.js";
import {
  icon,
  heading,
  card,
  link,
  stats,
  resourceMenu,
  illustration,
  alberello,
  avatar,
} from "../ui/components.js";

const dateLabel = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const pigna = (size = "size-24 sm:size-36") =>
  `<img src="assets/images/pigna.png" alt="Pigna, la compagna del tuo percorso" width="75" height="85" class="${size} shrink-0 object-contain">`;

const primaryLink = (route, label) =>
  `<a class="btn btn-primary h-auto min-h-11 whitespace-normal" href="#${route}">${label}${icon("arrow-right")}</a>`;

export function onboarding({ state }) {
  return `${heading("Benvenuto in PREVEDIApp.", "Coltiva piccoli gesti quotidiani, al tuo ritmo.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Cresciamo insieme",
    `<figure>${alberello(state, "size-48 sm:size-64")}</figure><p>Alberello accompagna il tuo percorso. Ogni attività che registri trova posto nel diario e contribuisce alle tue foglie.</p><p class="text-sm text-base-content/85">Le foglie celebrano le abitudini registrate; non misurano la salute.</p>`,
    "",
    "bg-primary/15 order-2 @4xl:order-1",
  )}<div class="order-1 grid gap-6 @4xl:order-2">${card(
    "Da dove vuoi iniziare?",
    `<p>Il questionario educativo sul rischio riprende il test CDC. Puoi esplorarlo prima del percorso: le risposte restano in questa sessione e non sono una diagnosi.</p><p class="text-sm text-base-content/85">Puoi anche iniziare dal tuo profilo e scegliere gli obiettivi personali, senza creare un account.</p>`,
    `${primaryLink("rischio", "Inizia il test educativo")}${link("profilo", "Personalizza il tuo percorso")}`,
  )}${card(
    "Il programma, ogni giorno",
    resourceMenu([
      [
        "conosci-pigna",
        "chat-bubble-left-right",
        "Conosci Pigna",
        "Quattro temi e risposte guidate locali",
      ],
      [
        "percorso",
        "home",
        "I tuoi piccoli passi",
        "Pasti, movimento, riposo e pause per te",
      ],
      [
        "diario",
        "calendar-days",
        "Il tuo diario",
        "Registrazioni che puoi modificare ed esportare",
      ],
      [
        "informazioni",
        "book-open",
        "Informazioni e fonti",
        "Scopo del prototipo e riferimenti educativi",
      ],
    ]),
  )}</div></div><p class="mt-6 max-w-[72ch] text-sm text-base-content/85">Il tuo percorso viene salvato in questo browser. Dal profilo puoi esportarlo, ripristinarlo o cancellarlo. Non c’è sincronizzazione fra dispositivi.</p>`;
}

export function pignaIntro() {
  const topics = [
    [
      "chart-pie",
      "Alimentazione",
      "Esplora il piatto, gli ingredienti e il diario dei pasti.",
    ],
    [
      "bolt",
      "Attività fisica",
      "Scegli come muoverti e registra il tempo che hai dedicato al movimento.",
    ],
    [
      "moon",
      "Sonno",
      "Prepara la tua routine serale e racconta il riposo nel diario.",
    ],
    [
      "face-smile",
      "Stress e benessere",
      "Trova una pausa e un momento per osservare il respiro.",
    ],
  ];
  return `${heading("Ciao, sono Pigna!", "Una compagna per esplorare il tuo percorso quotidiano.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Un piccolo consiglio, quando ti va",
    `<figure>${pigna("size-40 sm:size-48")}</figure><p>Ho risposte guidate su quattro temi. Posso indicarti dove trovare un’attività o registrare ciò che hai fatto.</p><p class="text-sm text-base-content/85">Le risposte sono predefinite. Non offro indicazioni mediche personalizzate e non uso un servizio AI esterno.</p>`,
    primaryLink("assistente", "Parla con Pigna"),
    "bg-accent/20",
  )}${card(
    "Come posso accompagnarti?",
    `<ul class="list">${topics.map(([symbol, title, text]) => `<li class="list-row items-start px-0">${avatar(icon(symbol), "bg-base-200")}<div class="min-w-0"><h3 class="font-sans text-sm font-semibold">${title}</h3><p class="mt-1 text-sm text-base-content/85">${text}</p></div></li>`).join("")}</ul>`,
    link("percorso", "Apri il tuo percorso"),
  )}</div>`;
}

export function movementDetail({ state }) {
  const report = habitReport(state, "movement", 7),
    today = dayEntries(state).filter((entry) => entry.type === "movement"),
    minutes = today.reduce(
      (sum, entry) => sum + (Number(entry.minutes) || 0),
      0,
    ),
    goal = Number(state.goals.movement) || 30,
    datesWithEntries = new Set(
      state.entries
        .filter((entry) => entry.type === "movement")
        .map((entry) => entry.date),
    );
  const week = `<ul class="list">${report.dates.map((date, index) => `<li class="list-row grid-cols-[1fr_auto] items-center px-0"><span>${dateLabel.format(new Date(`${date}T12:00:00`))}${date === localDate() ? " · oggi" : ""}</span><span class="text-sm tabular-nums ${datesWithEntries.has(date) ? "font-semibold" : "text-base-content/85"}">${datesWithEntries.has(date) ? `${report.values[index]} min` : "Non registrato"}</span></li>`).join("")}</ul>`;
  return `${heading("Il tuo movimento, giorno per giorno.", "I minuti delle tue attività, come li hai raccontati nel diario.", link("attivita", "Torna ad Attività fisica", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card(
    "Attività settimanale",
    `${stats([
      [report.total, "minuti negli ultimi 7 giorni"],
      [report.registeredDays, "giorni con una registrazione"],
    ])}${week}<p class="text-xs text-base-content/85">Un giorno non registrato non è un giorno senza movimento: manca una voce nel diario.</p>`,
    link("progressi", "Esplora tutti i progressi"),
  )}${card(
    "Il movimento di oggi",
    `<figure>${illustration("attivita", "size-24 sm:size-36")}</figure><p class="text-sm">${minutes} di ${goal} minuti scelti da te</p><progress class="progress progress-primary w-full" value="${Math.min(minutes, goal)}" max="${goal}" aria-label="Minuti registrati rispetto al tuo obiettivo personale"></progress><p class="text-xs text-base-content/85">${today.length ? `${today.length} ${today.length === 1 ? "attività registrata" : "attività registrate"} oggi.` : "Aggiungi un’attività dopo averla svolta."}</p>`,
    `<button class="btn btn-primary min-h-11" data-action="open-entry" data-type="movement">${icon("plus")}Registra attività</button>`,
  )}</div><div class="mt-6">${card(
    "Scegli come muoverti",
    resourceMenu([
      [
        "risveglio",
        "sun",
        "Risveglio muscolare",
        "Quattro gesti da scegliere al tuo ritmo",
      ],
      [
        "attivita",
        "bolt",
        "Camminata e altre attività",
        "Racconta ciò che hai fatto, con durata e note",
      ],
      [
        "quiz/attivita",
        "book-open",
        "Quiz sul movimento",
        "Tre domande per esplorare il tema",
      ],
    ]),
  )}</div>`;
}

export function wakeup({ ui }) {
  const guided = ui?.guided || {},
    selected = validExerciseIds(guided.exerciseIds),
    minutes = validExerciseMinutes(guided.exerciseMinutes) || 5;
  const choices = `<fieldset class="fieldset gap-4"><legend class="fieldset-legend">Quali gesti hai fatto?</legend>${exercises.map((exercise) => `<label class="label min-h-11 items-start gap-3 whitespace-normal text-base-content"><input class="checkbox mt-1 shrink-0" type="checkbox" data-action="wake-toggle" data-id="${exercise.id}" ${selected.includes(exercise.id) ? "checked" : ""}><span class="min-w-0"><strong class="block text-sm font-semibold">${exercise.label}</strong><span class="mt-1 block text-sm text-base-content/85">${exercise.description}</span></span></label>`).join("")}</fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Minuti effettivi di movimento</legend><label class="sr-only" for="wake-minutes">Minuti effettivi di movimento</label><input id="wake-minutes" class="input border-secondary/75 w-full" type="number" min="1" max="180" step="1" value="${minutes}" aria-describedby="wake-duration-help"><p id="wake-duration-help" class="text-xs text-base-content/85">Inserisci il tempo che hai dedicato alla routine, da 1 a 180 minuti.</p></fieldset><p id="wake-selection" class="text-sm text-base-content/85">${selected.length ? `${selected.length} ${selected.length === 1 ? "gesto selezionato" : "gesti selezionati"}. La registrazione comparirà nel diario di oggi.` : "Seleziona almeno un gesto prima di registrare la routine."}</p>`;
  return `${heading("Risveglio muscolare con Pigna.", "Scegli gesti che ti sono comodi. Registra la routine dopo averla svolta.", link("dettaglio-attivita", "Dettaglio attività", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card(
    "La tua routine mattutina",
    choices,
    `<button class="btn btn-primary h-auto min-h-11 whitespace-normal" data-action="wake-save" aria-describedby="wake-selection" ${selected.length ? "" : "disabled"}>${icon("check")}Registra la routine</button>`,
  )}${card(
    "Al tuo ritmo",
    `<figure>${illustration("attivita", "size-24 sm:size-36")}</figure><p>Puoi scegliere uno o più gesti, senza dover completare tutto l’elenco. Non è un allenamento cronometrato.</p><p class="text-sm text-base-content/85">La registrazione racconta ciò che hai fatto: minuti, attività e note restano modificabili nel diario.</p>`,
    link("diario", "Apri il diario"),
    "bg-accent/25",
  )}</div>`;
}

export function sleepGuide({ state, ui }) {
  const selected = validRoutineIds(state.sleepRoutine || ui?.guided?.routine),
    reminder = state.sleepReminder || { enabled: false, time: "21:30" },
    time = /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time)
      ? reminder.time
      : "21:30";
  const checklist = `<p>Una routine è un piccolo spazio che scegli per te. Puoi adattarla alle tue preferenze e cambiarla quando vuoi.</p><fieldset class="fieldset gap-4"><legend class="fieldset-legend">I gesti della tua sera</legend>${sleepRoutine.map((item) => `<label class="label min-h-11 items-start gap-3 whitespace-normal text-base-content"><input type="checkbox" class="checkbox mt-1 shrink-0" data-action="routine-toggle" data-id="${item.id}" ${selected.includes(item.id) ? "checked" : ""}><span class="min-w-0"><strong class="block text-sm font-semibold">${item.label}</strong><span class="mt-1 block text-sm text-base-content/85">${item.description}</span></span></label>`).join("")}</fieldset><p class="text-xs text-base-content/85">Le preferenze restano in questo browser. Spuntare la routine non registra ore di sonno.</p>`;
  const reminderFields = `<fieldset class="fieldset"><legend class="fieldset-legend">Orario che preferisci</legend><label class="sr-only" for="sleep-reminder-time">Orario del promemoria serale</label><input id="sleep-reminder-time" class="input border-secondary/75 w-full" type="time" value="${time}" aria-describedby="sleep-reminder-help"><p id="sleep-reminder-help" class="text-xs text-base-content/85">Il promemoria appare nel sito quando lo apri. Non invia notifiche al telefono e non funziona come sveglia.</p></fieldset><p id="sleep-reminder-status" class="text-sm" role="status">${reminder.enabled ? `Promemoria locale attivo · ${time}` : "Promemoria locale disattivato"}</p>`;
  return `${heading("Una sera tranquilla, lontano dagli schermi.", "Piccoli gesti da scegliere e ritrovare nella tua routine serale.", link("sonno", "Torna al Sonno", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card(
    "Costruisci la tua routine",
    checklist,
    link("sessione/pace", "Ritaglia una pausa tranquilla"),
  )}${card(
    "Promemoria della sera",
    `<figure>${illustration("sonno", "size-24 sm:size-36")}</figure>${reminderFields}`,
    `<button class="btn btn-primary h-auto min-h-11 whitespace-normal" data-action="sleep-reminder">${icon("bell")}${reminder.enabled ? "Disattiva promemoria" : "Attiva promemoria"}</button>`,
  )}</div><div class="mt-6">${card(
    "Domattina, racconta il tuo riposo",
    "<p>Nel diario del sonno puoi aggiungere le ore dormite e come ti sei sentito. Le registrazioni ti aiutano a ritrovare le tue abitudini nel tempo.</p>",
    link("sonno", "Apri il diario del sonno"),
  )}</div>`;
}

export function mindfulness({ ui }) {
  const categories = [
      ["tutte", "Tutte"],
      ["respiro", "Respiro"],
      ["natura", "Natura"],
      ["guidata", "Riflessione"],
    ],
    requested = ui?.guided?.category,
    category = categories.some(([id]) => id === requested)
      ? requested
      : "tutte",
    sessions = meditations.filter(
      (session) => category === "tutte" || session.category === category,
    );
  const filter = `<div class="flex flex-wrap gap-2" role="group" aria-label="Categorie delle pause">${categories.map(([id, label]) => `<button type="button" class="btn btn-outline min-h-11 ${id === category ? "btn-active" : ""}" data-action="mindfulness-filter" data-id="${id}" aria-pressed="${id === category}">${label}</button>`).join("")}</div>`;
  const list = `<ul class="list">${sessions.map((session) => `<li class="list-row items-start px-0">${avatar(icon(session.icon), "bg-secondary/15")}<div class="min-w-0"><h3 class="font-sans text-base font-semibold">${session.title}</h3><p class="mt-1 text-xs text-base-content/85">${session.minutes} min · ${session.categoryLabel}</p><p class="mt-2 text-sm text-base-content/85">${session.description}</p></div><a class="btn btn-outline btn-square min-h-11 min-w-11" href="#sessione/${session.id}" aria-label="Apri ${session.title}">${icon("play")}</a></li>`).join("")}</ul>`;
  return `${heading("Meditazione e mindfulness.", "Tre pause da esplorare, con un timer e spunti scritti.", link("benessere", "Benessere e riposo", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Un momento con Pigna",
    `<figure>${illustration("stress", "size-24 sm:size-36")}</figure><p>Trova un posto comodo e scegli quanto tempo vuoi dedicare alla pausa. Puoi fermarti e riprendere quando ti va.</p><p class="text-sm text-base-content/85">Queste sessioni sono locali, con istruzioni scritte. Non includono una traccia audio.</p>`,
    primaryLink("sessione/pace", "Apri Pace Interiore"),
    "bg-secondary/15",
  )}${card("Esplora le sessioni", `${filter}${list}`)}</div>`;
}

export function guidedSession({ guidedTimer }, id = "pace") {
  const session = safeSession(id),
    total = session.minutes * 60,
    timer = guidedTimer || {},
    duration =
      Number.isFinite(timer.duration) && timer.duration > 0
        ? timer.duration
        : total,
    remaining = Number.isFinite(timer.remaining)
      ? Math.max(0, Math.min(timer.remaining, duration))
      : duration,
    running = !!timer.running,
    started = !!timer.started,
    status = running
      ? "Pausa in corso"
      : started
        ? "Pausa sospesa"
        : "Pronta quando vuoi",
    label = running ? "Pausa" : started ? "Riprendi" : "Inizia la sessione";
  const controls = `<div class="flex flex-col items-center gap-4 py-2"><figure>${illustration("stress", "size-24 sm:size-36")}</figure><div id="guided-time" class="font-serif text-4xl font-medium tabular-nums" role="timer" aria-live="off" aria-label="Tempo rimanente">${formatTime(remaining)}</div><p id="guided-status" class="text-sm text-base-content/85" role="status">${status}</p><progress id="guided-progress" class="progress progress-primary w-full" value="${duration - remaining}" max="${duration}" aria-label="Tempo trascorso nella sessione"></progress></div><p class="text-sm text-base-content/85">${session.minutes} minuti · il timer continua durante la navigazione nel sito. Ricaricare o chiudere la pagina interrompe la sessione.</p>`;
  const prompts = `<ol class="list-decimal space-y-4 pl-5 text-sm leading-relaxed"><li>${session.prompt}</li><li>${session.closing}</li><li>Alla fine, prenditi un istante per notare come ti senti e tornare alle tue attività.</li></ol><p class="text-xs text-base-content/85">Al completamento, la durata viene registrata nel diario come pausa per te. Il timer misura il tempo della sessione, senza valutare la salute.</p>`;
  return `${heading(session.title, session.description, link("meditazione", "Tutte le sessioni", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1fr]">${card(
    "La tua sessione",
    controls,
    `<button id="guided-toggle" class="btn btn-primary h-auto min-h-11 whitespace-normal" data-action="guided-toggle" data-id="${session.id}">${icon(running ? "pause" : "play")}${label}</button><button class="btn btn-outline min-h-11" data-action="guided-reset" data-id="${session.id}">${icon("arrow-path")}Ricomincia</button>`,
  )}${card("Spunti per la pausa", prompts, link("diario", "Apri il diario"))}</div>`;
}

export function benessereHub() {
  return `${heading("Benessere e riposo.", "Trova un momento per te, tra pause, respiro e abitudini della sera.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Riposa la mente",
    `<figure>${illustration("stress", "size-24 sm:size-36")}</figure><p>Una pausa breve o un tempo più lungo: scegli ciò che si adatta alla tua giornata. Pigna ti accompagna con spunti scritti.</p><p class="text-sm text-base-content/85">Il diario raccoglie il tempo che registri, senza attribuirgli un risultato clinico.</p>`,
    primaryLink("meditazione", "Esplora le pause"),
    "bg-secondary/15",
  )}${card(
    "Esplora il benessere",
    resourceMenu([
      [
        "meditazione",
        "heart",
        "Meditazione e mindfulness",
        "Pace Interiore, Bosco Incantato e Respiro Profondo",
      ],
      [
        "stress",
        "face-smile",
        "Respirazione con Pigna",
        "Una pausa da 1, 3 o 5 minuti",
      ],
      [
        "luce-blu",
        "moon",
        "La tua routine serale",
        "Preferenze e promemoria locali",
      ],
      [
        "sonno",
        "calendar-days",
        "Racconta il tuo riposo",
        "Ore e sensazioni nel diario del sonno",
      ],
    ]),
    link("progressi", "Ritrova le tue abitudini"),
  )}</div>`;
}
