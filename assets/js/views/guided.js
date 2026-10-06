import { dayEntries, localDate } from "../../data.js";
import { habitReport } from "../insights.js";
import { formatTime } from "../timer.js";
import {
  exercises,
  sleepRoutine,
  meditations,
  validExerciseIds,
  validRoutineIds,
  safeSession,
} from "../guided-content.js";
import { initialPractice, guidedStage } from "../guided-flow.js";
import {
  practiceButton,
  practiceSteps,
  practiceCurrent,
  gestureList,
  pauseSummary,
  pauseOutcome,
} from "../ui/guided-widgets.js";
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
  esc,
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

const practiceCard = (title, body, actions) =>
  card(
    "",
    `<h2 id="practice-heading" tabindex="-1" class="card-title font-serif text-xl font-medium focus:outline-none">${esc(title)}</h2>${body}`,
    actions,
  );

export function onboarding({ state }) {
  return `${heading("Benvenuto in PREVEDIApp.", "Coltiva piccoli gesti quotidiani, al tuo ritmo.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Cresciamo insieme",
    `<figure>${alberello(state, "size-48 sm:size-64")}</figure><p>Alberello accompagna il tuo percorso. Ogni attività che registri trova posto nel diario e contribuisce alle tue foglie.</p><p class="text-sm text-base-content/90">Le foglie celebrano le abitudini registrate; non misurano la salute.</p>`,
    "",
    "bg-primary/15 order-2 @4xl:order-1",
  )}<div class="order-1 grid gap-6 @4xl:order-2">${card(
    "Da dove vuoi iniziare?",
    `<p>Il questionario educativo sul rischio riprende il test CDC. Puoi esplorarlo prima del percorso: le risposte restano in questa sessione e non sono una diagnosi.</p><p class="text-sm text-base-content/90">Puoi anche iniziare dal tuo profilo e scegliere gli obiettivi personali, senza creare un account.</p>`,
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
  )}</div></div><p class="mt-6 max-w-[72ch] text-sm text-base-content/90">Il tuo percorso viene salvato in questo browser. Dal profilo puoi esportarlo, ripristinarlo o cancellarlo. Non c’è sincronizzazione fra dispositivi.</p>`;
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
    `<figure>${pigna("size-40 sm:size-48")}</figure><p>Ho risposte guidate su quattro temi. Posso indicarti dove trovare un’attività o registrare ciò che hai fatto.</p><p class="text-sm text-base-content/90">Le risposte sono predefinite. Non offro indicazioni mediche personalizzate e non uso un servizio AI esterno.</p>`,
    primaryLink("assistente", "Parla con Pigna"),
    "bg-accent/20",
  )}${card(
    "Come posso accompagnarti?",
    `<ul class="list">${topics.map(([symbol, title, text]) => `<li class="list-row items-start px-0">${avatar(icon(symbol), "bg-base-200")}<div class="min-w-0"><h3 class="font-sans text-sm font-semibold">${title}</h3><p class="mt-1 text-sm text-base-content/90">${text}</p></div></li>`).join("")}</ul>`,
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
  const week = `<ul class="list">${report.dates.map((date, index) => `<li class="list-row grid-cols-[1fr_auto] items-center px-0"><span>${dateLabel.format(new Date(`${date}T12:00:00`))}${date === localDate() ? " · oggi" : ""}</span><span class="text-sm tabular-nums ${datesWithEntries.has(date) ? "font-semibold" : "text-base-content/90"}">${datesWithEntries.has(date) ? `${report.values[index]} min` : "Non registrato"}</span></li>`).join("")}</ul>`;
  return `${heading("Il tuo movimento, giorno per giorno.", "I minuti delle tue attività, come li hai raccontati nel diario.", link("attivita", "Torna ad Attività fisica", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card(
    "Attività settimanale",
    `${stats([
      [report.total, "minuti negli ultimi 7 giorni"],
      [report.registeredDays, "giorni con una registrazione"],
    ])}${week}<p class="text-xs text-base-content/90">Un giorno non registrato non è un giorno senza movimento: manca una voce nel diario.</p>`,
    link("progressi", "Esplora tutti i progressi"),
  )}${card(
    "Il movimento di oggi",
    `<figure>${illustration("attivita", "size-24 sm:size-36")}</figure><p class="text-sm">${minutes} di ${goal} minuti scelti da te</p><progress class="progress progress-primary w-full" value="${Math.min(minutes, goal)}" max="${goal}" aria-label="Minuti registrati rispetto al tuo obiettivo personale"></progress><p class="text-xs text-base-content/90">${today.length ? `${today.length} ${today.length === 1 ? "attività registrata" : "attività registrate"} oggi.` : "Aggiungi un’attività dopo averla svolta."}</p>`,
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
    practice = ui?.practices?.wakeup || initialPractice(),
    completed = validExerciseIds(practice.completed);
  let body, actions, title;
  if (practice.phase === "choose") {
    title = "Scegli i tuoi gesti";
    body = `${practiceSteps(practice)}<fieldset class="fieldset gap-4"><legend class="fieldset-legend">Quali gesti vuoi includere?</legend>${exercises.map((exercise) => `<label class="label min-h-11 items-start gap-3 whitespace-normal text-base-content"><input class="checkbox mt-1 shrink-0" type="checkbox" data-action="wake-toggle" data-id="${exercise.id}" aria-labelledby="wake-label-${exercise.id}" aria-describedby="wake-help-${exercise.id}" ${selected.includes(exercise.id) ? "checked" : ""}><span class="min-w-0"><strong id="wake-label-${exercise.id}" class="block text-sm font-semibold">${exercise.label}</strong><span id="wake-help-${exercise.id}" class="mt-1 block text-sm text-base-content/90">${exercise.description}</span></span></label>`).join("")}</fieldset><p id="wake-selection" class="text-sm text-base-content/90" role="status">${selected.length ? `${selected.length} ${selected.length === 1 ? "gesto scelto" : "gesti scelti"}. Puoi modificare la scelta prima di cominciare.` : "Scegli almeno un gesto. Puoi praticarne uno solo."}</p>`;
    actions = `${practiceButton("wakeup", "start", "Prepara la routine", { primary: true, disabled: !selected.length, symbol: "arrow-right" })}${practiceButton("wakeup", "start", "Ho già svolto la routine", { mode: "review", disabled: !selected.length })}`;
  } else if (practice.phase === "prepare") {
    title = "Preparati, al tuo ritmo";
    body = `${practiceSteps(practice)}<div id="practice-current" tabindex="-1" class="focus:outline-none"><p>Scegli uno spazio e una posizione comodi. Segui soltanto i gesti che ti sono familiari; puoi fermarti o saltarne uno quando vuoi.</p><p class="mt-3 text-sm text-base-content/90">Non è un allenamento cronometrato. Decidi tu quando passare al gesto successivo.</p></div>${gestureList(practice.ids, exercises)}`;
    actions = `${practiceButton("wakeup", "begin", "Comincia dal primo gesto", { primary: true, symbol: "play" })}${practiceButton("wakeup", "back", "Modifica la scelta", { symbol: "arrow-left" })}`;
  } else if (practice.phase === "active") {
    title = "La tua routine mattutina";
    body = practiceCurrent("wakeup", practice, exercises);
    actions = "";
  } else if (practice.phase === "review") {
    title = "Racconta la routine che hai fatto";
    body = `${practiceSteps(practice)}<div id="practice-current" tabindex="-1" class="focus:outline-none"><p>${completed.length ? `${completed.length} ${completed.length === 1 ? "gesto fatto" : "gesti fatti"}. Registra soltanto il tempo che hai dedicato alla routine.` : "Hai saltato tutti i gesti. Puoi tornare alla pratica o scegliere un’altra routine."}</p></div>${gestureList(practice.ids, exercises, completed)}<fieldset class="fieldset"><legend class="fieldset-legend">Minuti effettivi di movimento</legend><label class="sr-only" for="practice-minutes">Minuti effettivi di movimento</label><input id="practice-minutes" data-practice="wakeup" class="input border-secondary/75 w-full" type="number" min="1" max="180" step="1" required value="${esc(practice.minutes)}" placeholder="Inserisci i minuti che hai fatto" aria-describedby="practice-duration-help practice-error"><p id="practice-duration-help" class="text-xs text-base-content/90">Il tempo che hai dedicato alla routine, da 1 a 180 minuti. Potrai correggerlo nel diario.</p></fieldset><p id="practice-error" class="text-sm text-error" role="alert" tabindex="-1"></p>`;
    actions = `${practiceButton("wakeup", "save", "Registra nel diario di oggi", { primary: true, disabled: !completed.length, symbol: "check" })}${practiceButton("wakeup", "back", "Torna ai gesti", { symbol: "arrow-left" })}${practiceButton("wakeup", "reset", "Scegli un’altra routine")}`;
  } else {
    title = practice.entryMissing
      ? "Routine completata"
      : "La tua routine è nel diario";
    body = `${practiceSteps(practice)}${pauseOutcome({ ...practice, minutes: Number(practice.minutes) }, "La tua routine")}${gestureList(completed, exercises, completed)}`;
    actions = practiceButton("wakeup", "reset", "Prepara una nuova routine", {
      symbol: "arrow-path",
    });
  }
  return `${heading("Risveglio muscolare con Pigna.", "Scegli gesti che ti sono comodi, seguili al tuo ritmo e registra ciò che hai fatto.", link("dettaglio-attivita", "Dettaglio attività", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${practiceCard(title, body, actions)}${card(
    "Al tuo ritmo",
    `<figure>${illustration("attivita", "size-24 sm:size-36")}</figure><p>Puoi scegliere uno o più gesti, senza dover completare tutto l’elenco. Pausa e Salta restano disponibili durante la pratica.</p><p class="text-sm text-base-content/90">La registrazione racconta ciò che hai fatto: minuti, attività e note restano modificabili nel diario. Una pratica incompleta si interrompe ricaricando la pagina.</p>`,
    link("diario", "Apri il diario"),
    "bg-accent/25",
  )}</div>`;
}

export function sleepGuide({ state, ui }) {
  const selected = validRoutineIds(state.sleepRoutine || ui?.guided?.routine),
    practice = ui?.practices?.evening || initialPractice(),
    completed = validRoutineIds(practice.completed),
    reminder = state.sleepReminder || { enabled: false, time: "21:30" },
    time =
      typeof ui?.guided?.reminderTime === "string"
        ? ui.guided.reminderTime
        : /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time)
          ? reminder.time
          : "21:30";
  let routine, actions, title;
  if (practice.phase === "choose") {
    title = "Costruisci la tua routine";
    routine = `${practiceSteps(practice)}<p>Una routine è un piccolo spazio che scegli per te. Puoi adattarla alle tue preferenze e cambiarla quando vuoi.</p><fieldset class="fieldset gap-4"><legend class="fieldset-legend">Gesti da includere nella mia routine</legend>${sleepRoutine.map((item) => `<label class="label min-h-11 items-start gap-3 whitespace-normal text-base-content"><input type="checkbox" class="checkbox mt-1 shrink-0" data-action="routine-toggle" data-id="${item.id}" aria-labelledby="routine-label-${item.id}" aria-describedby="routine-help-${item.id}" ${selected.includes(item.id) ? "checked" : ""}><span class="min-w-0"><strong id="routine-label-${item.id}" class="block text-sm font-semibold">${item.label}</strong><span id="routine-help-${item.id}" class="mt-1 block text-sm text-base-content/90">${item.description}</span></span></label>`).join("")}</fieldset><p class="text-sm text-base-content/90" role="status">${selected.length ? `${selected.length} ${selected.length === 1 ? "gesto scelto" : "gesti scelti"} nella tua routine.` : "Scegli almeno un gesto per preparare la tua sera."}</p><p class="text-xs text-base-content/90">Queste sono preferenze salvate nel browser. Le spunte indicano i gesti scelti, non quelli già fatti stasera.</p>`;
    actions = practiceButton("evening", "start", "Prepara la mia sera", {
      primary: true,
      disabled: !selected.length,
      symbol: "arrow-right",
    });
  } else if (practice.phase === "prepare") {
    title = "Uno spazio per la tua sera";
    routine = `${practiceSteps(practice)}<div id="practice-current" tabindex="-1" class="focus:outline-none"><p>Osserva come ti senti e scegli uno spazio comodo. Puoi seguire i gesti della tua routine o saltarne uno.</p><p class="mt-3 text-sm text-base-content/90">Decidi tu il tempo di ogni gesto. Ricaricare la pagina interrompe questa pratica; le preferenze restano salvate.</p></div>${gestureList(practice.ids, sleepRoutine)}`;
    actions = `${practiceButton("evening", "begin", "Comincia dal primo gesto", { primary: true, symbol: "play" })}${practiceButton("evening", "back", "Modifica la routine", { symbol: "arrow-left" })}`;
  } else if (practice.phase === "active") {
    title = "I gesti della tua sera";
    routine = practiceCurrent("evening", practice, sleepRoutine);
    actions = "";
  } else if (practice.phase === "review") {
    title = "La tua sera, al tuo ritmo";
    routine = `${practiceSteps(practice)}<div id="practice-current" tabindex="-1" class="focus:outline-none"><p>${completed.length ? "Hai dedicato uno spazio ai gesti che hai scelto. Puoi concludere la routine o tornare a un gesto." : "Hai saltato tutti i gesti. Puoi concludere qui o tornare alla tua routine."}</p></div>${gestureList(practice.ids, sleepRoutine, completed)}`;
    actions = `${practiceButton("evening", "save", "Concludi la routine della sera", { primary: true, symbol: "check" })}${practiceButton("evening", "back", "Torna ai gesti", { symbol: "arrow-left" })}`;
  } else {
    title = "La tua routine della sera è conclusa";
    routine = `${practiceSteps(practice)}<div id="practice-current" class="alert alert-soft alert-success" tabindex="-1" role="status">${icon("check")}<span>Puoi lasciare questo spazio e tornare alla tua sera al tuo ritmo.</span></div>${gestureList(practice.ids, sleepRoutine, completed)}<p class="text-sm text-base-content/90">Domattina potrai raccontare ore e sensazioni nel diario del sonno.</p>`;
    actions = `${link("sonno", "Apri il diario del sonno")}${practiceButton("evening", "reset", "Ritrova i gesti della routine", { symbol: "arrow-path" })}`;
  }
  const reminderFields = `<fieldset class="fieldset"><legend class="fieldset-legend">Orario che preferisci</legend><label class="sr-only" for="sleep-reminder-time">Orario del promemoria serale</label><input id="sleep-reminder-time" class="input border-secondary/75 w-full" type="time" value="${esc(time)}" aria-describedby="sleep-reminder-help"><p id="sleep-reminder-help" class="text-xs text-base-content/90">Il promemoria appare nel sito quando lo apri. Non invia notifiche al telefono e non funziona come sveglia.</p></fieldset><p id="sleep-reminder-status" class="text-sm" role="status">${reminder.enabled ? `Promemoria locale attivo · ${esc(reminder.time)}` : "Promemoria locale disattivato"}</p>`;
  return `${heading("Una sera tranquilla, lontano dagli schermi.", "Piccoli gesti da scegliere e ritrovare nella tua routine serale.", link("sonno", "Torna al Sonno", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${practiceCard(
    title,
    routine,
    actions,
  )}${card(
    "Promemoria della sera",
    `<figure>${illustration("sonno", "size-24 sm:size-36")}</figure>${reminderFields}`,
    `<button class="btn btn-primary h-auto min-h-11 whitespace-normal" data-action="sleep-reminder" aria-describedby="sleep-reminder-help sleep-reminder-status" aria-pressed="${!!reminder.enabled}">${icon("bell")}${reminder.enabled ? "Disattiva promemoria" : "Attiva promemoria"}</button>`,
  )}</div><div class="mt-6">${card(
    "Una pausa scritta, se ti va",
    "<p>Puoi ritagliare un momento tranquillo con Pace Interiore, oppure domattina raccontare il tuo riposo nel diario del sonno.</p>",
    `${link("sessione/pace", "Ritaglia una pausa tranquilla")}${link("sonno", "Apri il diario del sonno")}`,
  )}</div>`;
}

export function mindfulness({ ui, pauseSummary: currentPause }) {
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
  const list = `<ul class="list">${sessions.map((session) => `<li class="list-row items-start px-0">${avatar(icon(session.icon), "bg-secondary/15")}<div class="min-w-0"><h3 class="font-sans text-base font-semibold">${session.title}</h3><p class="mt-1 text-xs text-base-content/90">${session.minutes} min · ${session.categoryLabel}</p><p class="mt-2 text-sm text-base-content/90">${session.description}</p></div><a class="btn btn-outline h-auto min-h-11 whitespace-normal" href="#sessione/${session.id}" aria-label="Apri ${session.title}">Apri${icon("arrow-right")}</a></li>`).join("")}</ul>`;
  return `${heading("Meditazione e mindfulness.", "Tre pause da esplorare, con un timer e spunti scritti.", link("benessere", "Benessere e riposo", "arrow-left"))}${currentPause ? `<div class="mb-6">${pauseSummary(currentPause)}</div>` : ""}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Un momento con Pigna",
    `<figure>${illustration("stress", "size-24 sm:size-36")}</figure><p>Trova un posto comodo e scegli una pausa da 5, 10 o 15 minuti. Uno spunto alla volta ti accompagna durante la sessione; puoi fermarti e riprendere quando ti va.</p><p class="text-sm text-base-content/90">Queste sessioni sono locali, con istruzioni scritte. Non includono una traccia audio.</p>`,
    primaryLink("sessione/pace", "Apri Pace Interiore"),
    "bg-secondary/15",
  )}${card("Esplora le sessioni", `${filter}${list}`)}</div>`;
}

export function guidedSession({ guidedTimer, ui }, id = "pace") {
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
    outcome = !started && !running ? ui?.pauseOutcomes?.[session.id] : null,
    stage = guidedStage(session, timer),
    status = running
      ? "Pausa in corso"
      : started
        ? "Pausa sospesa"
        : "Pronta quando vuoi",
    label = running
      ? "Metti in pausa"
      : started
        ? "Riprendi"
        : outcome
          ? "Nuova pausa"
          : "Inizia la sessione";
  const actions = `<div class="card-actions items-center gap-3"><button id="guided-toggle" class="btn btn-primary h-auto min-h-11 whitespace-normal" data-action="guided-toggle" data-id="${session.id}">${icon(running ? "pause" : "play")}${label}</button>${started || outcome ? `<button class="btn btn-outline min-h-11" data-action="guided-reset" data-id="${session.id}">${icon("arrow-path")}${outcome ? "Prepara di nuovo" : "Ricomincia"}</button>` : ""}</div>`;
  const writtenGuide = `<div id="guided-stage" data-stage="${stage.index}" tabindex="-1" class="py-2 focus:outline-none" role="status" aria-live="polite" aria-atomic="true"><h3 id="guided-stage-title" class="text-2xl">${stage.title}</h3><p id="guided-stage-text" class="mt-3 max-w-[72ch] text-base leading-relaxed">${stage.text}</p></div>${actions}<p id="guided-stage-count" class="text-xs text-base-content/90">${stage.index < 0 ? "Tre spunti scritti durante la pausa" : `Spunto ${stage.index + 1} di ${stage.total}`}</p><ul class="steps steps-horizontal w-full text-xs" aria-label="Spunti della pausa">${["Inizio", "Durante", "Chiusura"].map((name, index) => `<li id="guided-stage-${index}" class="step min-w-0${index <= stage.index ? " step-primary" : ""}" ${index === stage.index ? 'aria-current="step"' : ""}>${name}</li>`).join("")}</ul>`;
  const controls = outcome
    ? `${pauseOutcome(outcome, session.title, session.id)}<div id="guided-stage" tabindex="-1" class="py-2 focus:outline-none"><h3 class="text-2xl">Torna alle tue attività, al tuo ritmo</h3><p class="mt-3 text-base leading-relaxed">Prenditi un istante per notare come ti senti. Puoi lasciare qui la pausa o dedicarti un nuovo momento.</p></div>${actions}`
    : `${writtenGuide}<div class="flex flex-col items-center gap-3 py-2"><div id="guided-time" class="font-serif text-4xl font-medium tabular-nums" role="timer" aria-live="off" aria-label="Tempo rimanente">${formatTime(remaining)}</div><p id="guided-status" class="text-sm text-base-content/90" role="status">${status}</p><progress id="guided-progress" class="progress progress-primary w-full" value="${duration - remaining}" max="${duration}" aria-label="Tempo trascorso nella sessione"></progress></div><p class="text-xs text-base-content/90">${session.minutes} minuti · il timer continua durante la navigazione nel sito. Ricaricare o chiudere la pagina interrompe la sessione.</p>`;
  const prompts = `<figure>${illustration("stress", "size-24 sm:size-36")}</figure><p>Segui gli spunti senza cercare un risultato. Puoi tenere gli occhi aperti, fermarti e riprendere quando ti va.</p><p class="text-sm text-base-content/90">Al completamento, la durata viene registrata nel diario come pausa per te. Il timer misura il tempo dedicato alla sessione.</p>`;
  return `${heading(session.title, session.description, link("meditazione", "Tutte le sessioni", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1fr]">${card(
    outcome
      ? outcome.blocked
        ? "Pausa completata, registrazione da confermare"
        : outcome.entryMissing
          ? "Pausa completata"
          : outcome.saved === false
            ? "Pausa completata in questa sessione"
            : "La tua pausa è nel diario"
      : started
        ? "Uno spunto alla volta"
        : "Preparati alla tua sessione",
    controls,
  )}${card("Al tuo ritmo", prompts, link("diario", "Apri il diario"))}</div>`;
}

export function benessereHub({ pauseSummary: currentPause } = {}) {
  return `${heading("Benessere e riposo.", "Trova un momento per te, tra pause, respiro e abitudini della sera.")}${currentPause ? `<div class="mb-6">${pauseSummary(currentPause)}</div>` : ""}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card(
    "Riposa la mente",
    `<figure>${illustration("stress", "size-24 sm:size-36")}</figure><p>Una pausa breve o un tempo più lungo: scegli ciò che si adatta alla tua giornata. Pigna ti accompagna con spunti scritti.</p><p class="text-sm text-base-content/90">Il diario raccoglie il tempo che registri, senza attribuirgli un risultato clinico.</p>`,
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
