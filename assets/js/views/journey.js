import {
  localDate,
  missions,
  rewards,
  missionDone,
  totalPoints,
  availablePoints,
} from "../../data.js";
import {
  icon,
  esc,
  heading,
  avatar,
  titleRow,
  card,
  link,
  stats,
  pointsPill,
  alberello,
  illustration,
} from "../ui/components.js";
import { wellnessPalette } from "../config.js";
import {
  habitLabels,
  habitReport,
  milestones,
  quizSummary,
} from "../insights.js";
import { quizSets } from "../../data.js";

export function dashboard({ state }) {
  const done = missions.filter((m) => missionDone(state, m.id)).length,
    points = totalPoints(state),
    level = Math.floor(points / 100) + 1;
  const missionBody = `${titleRow("I tuoi piccoli passi di oggi", `<span class="badge badge-ghost whitespace-nowrap text-xs">${done}/4 completati</span>`, "daily-title")}
 <div><div class="mb-2 flex justify-between gap-3 text-xs text-base-content/85"><span>${done === 4 ? "Hai coltivato una bella giornata." : "Un gesto alla volta, al tuo ritmo."}</span><span>${done * 25}%</span></div><progress class="progress progress-primary w-full" value="${done}" max="4" aria-label="Missioni quotidiane completate"></progress></div>
 <ul class="list">${missions
   .map((m) => {
     const complete = missionDone(state, m.id);
     return `<li class="list-row items-center px-0">${avatar(icon(m.icon), wellnessPalette[m.route].avatar)}<div class="min-w-0"><strong class="block font-semibold">${m.title}</strong><p class="mt-1 text-xs text-base-content/85">${m.description}</p><span class="badge badge-sm ${complete ? "badge-success" : "badge-soft badge-accent text-accent-content"} mt-2">${complete ? "Completato oggi" : `+${m.points} foglie`}</span></div><a href="#${m.route}" class="btn btn-ghost btn-circle size-11 text-primary" aria-label="${m.title}: ${complete ? "completato" : m.action}">${icon(complete ? "check" : "arrow-right")}</a></li>`;
   })
   .join("")}</ul>`;
  const treeBody = `<p class="text-sm text-base-content/85">Ogni buona abitudine mette una nuova radice.</p><figure>${alberello(state, "mx-auto h-52 w-52 xl:h-60 xl:w-60")}</figure><div class="flex flex-col items-center gap-3"><span class="badge badge-soft badge-primary text-base-content">${icon("arrow-trending-up", "size-4")}Livello ${level} · ${level === 1 ? "Un nuovo inizio" : "Radici più forti"}</span><div class="w-full"><div class="mb-2 flex justify-between gap-2 text-xs text-base-content/85"><span>Verso il livello ${level + 1}</span><span>${points % 100}/100 foglie</span></div><progress class="progress progress-primary w-full" value="${points % 100}" max="100" aria-label="Crescita di Alberello"></progress></div></div>`;
  return `${heading(state.name ? `Ciao ${esc(state.name)}, cresciamo insieme.` : "Ogni piccolo passo conta.", "Prenditi cura di te. Il tuo Alberello crescerà con te.", pointsPill(state))}
 ${!state.onboarded ? `<div class="alert alert-soft alert-info mb-6 grid-cols-[auto_1fr] grid-flow-row items-start gap-x-3 gap-y-1 sm:alert-horizontal sm:grid-flow-col" role="status">${icon("information-circle")}<span>Il tuo percorso, dal tuo nome.</span><a href="#inizio" class="btn btn-ghost btn-sm col-start-2 min-h-11 justify-self-start sm:col-start-auto">Iniziamo insieme ${icon("arrow-right")}</a></div>` : ""}
 <div class="grid items-stretch gap-6 @4xl:grid-cols-[1.65fr_1fr]">${card("", missionBody, "", "bg-base-100", 'aria-labelledby="daily-title"')}${card("Il tuo Alberello", treeBody, link("giardino", "Visita il tuo giardino"), "bg-primary/15 text-center")}</div>
 <div class="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3"><h2>Coltiva il tuo equilibrio</h2>${link("diario", "Il mio diario")}</div>
 <div class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 @4xl:grid-cols-4">${[
   [
     "alimentazione",
     "chart-pie",
     "Alimentazione",
     "Più varietà nel tuo piatto",
   ],
   ["attivita", "bolt", "Attività fisica", "Trova il ritmo che fa per te"],
   ["sonno", "moon", "Sonno", "Fai spazio al tuo riposo"],
   [
     "stress",
     "face-smile",
     "Stress e benessere",
     "Ritrova un momento di calma",
   ],
 ]
   .map(
     ([id, sym, title, text]) =>
       `<a class="card card-border ${wellnessPalette[id].surface} transition-colors hover:bg-base-100" href="#${id}"><div class="card-body gap-3 p-4 sm:p-5"><div class="flex items-center justify-between gap-2">${icon(sym, wellnessPalette[id].icon)}${illustration(id, "size-14 sm:size-16")}${icon("arrow-right", "size-4")}</div><h3 class="card-title break-words font-serif text-base font-medium">${title}</h3><p class="text-xs text-base-content/85">${text}</p></div></a>`,
   )
   .join("")}</div>
 <aside class="card mt-6 bg-accent/20 sm:card-side"><figure class="px-5 pt-5 sm:py-5 sm:pr-0"><img src="assets/images/pigna.png" alt="" width="75" height="86" class="h-20 w-20 object-contain"></figure><div class="card-body gap-2 p-5"><h3 class="card-title font-serif text-lg font-medium">Non serve fare tutto, basta cominciare.</h3><p class="text-sm text-base-content/85">Sono Pigna, la tua compagna di percorso. Troviamo insieme un piccolo gesto per oggi?</p><div class="card-actions">${link("assistente", "Parla con Pigna")}</div></div></aside>`;
}

export function garden({ state }) {
  const points = totalPoints(state),
    level = Math.floor(points / 100) + 1;
  const decoration = rewards.find((reward) => reward.id === state.decoration);
  const tree = `<figure>${alberello(state)}</figure><span class="badge badge-soft badge-primary self-center text-base-content">${icon("arrow-trending-up", "size-4")}Livello ${level}</span><p class="text-center text-sm text-base-content/85">${decoration ? decoration.name : "Ogni foglia è un piccolo gesto per te."}</p><div><div class="mb-2 flex justify-between gap-2 text-xs"><span>Verso il livello ${level + 1}</span><span>${points % 100}/100 foglie</span></div><progress class="progress progress-primary w-full" value="${points % 100}" max="100" aria-label="Crescita verso il prossimo livello"></progress></div>`;
  const decorations = state.claimed.length
    ? `<fieldset class="fieldset w-full"><legend class="fieldset-legend">Scegli il tuo giardino</legend><div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-outline min-h-11 ${state.decoration === "none" ? "btn-primary btn-active" : ""}" data-action="decorate" data-id="none" aria-pressed="${state.decoration === "none"}">Alberello</button>${rewards
        .filter((reward) => state.claimed.includes(reward.id))
        .map(
          (reward) =>
            `<button class="btn btn-sm btn-outline h-auto min-h-11 max-w-full whitespace-normal py-2 ${state.decoration === reward.id ? "btn-primary btn-active" : ""}" data-action="decorate" data-id="${reward.id}" aria-pressed="${state.decoration === reward.id}">${icon(reward.icon)}<span class="min-w-0">${{ nest: "Nido", mushrooms: "Sottobosco", stars: "Stelle" }[reward.id] || reward.name}</span></button>`,
        )
        .join("")}</div></fieldset>`
    : link("percorso", "Coltiva il primo passo");
  const rewardBody = `<p class="text-sm text-base-content/85">Raccogli foglie con il diario e i quiz. Le ricompense cambiano l’illustrazione del tuo giardino.</p><ul class="list">${rewards
    .filter((reward) => !reward.preview)
    .map((reward) => {
      const owned = state.claimed.includes(reward.id),
        active = state.decoration === reward.id,
        missing = Math.max(0, reward.cost - availablePoints(state));
      return `<li class="list-row items-center px-0">${avatar(icon(reward.icon), "bg-accent/15")}<div class="min-w-0"><strong class="block font-semibold">${reward.name}</strong><p class="mt-1 text-xs text-base-content/85">${reward.description}</p>${!owned && missing ? `<p class="mt-2 text-xs">Ancora ${missing} foglie per sbloccarla.</p>` : ""}</div><button class="btn btn-outline btn-sm min-h-11 ${active ? "btn-primary" : ""}" data-action="${owned ? "decorate" : "claim"}" data-id="${reward.id}" ${active || (!owned && missing) ? "disabled" : ""}>${owned ? (active ? icon("check") + "In uso" : "Usa") : reward.cost + " foglie"}</button></li>`;
    })
    .join(
      "",
    )}</ul><div class="alert alert-info alert-soft" role="note">${icon("information-circle")}<span>${points} foglie raccolte · ${availablePoints(state)} disponibili. Usare le foglie non riduce il livello raggiunto. Le ricompense sono virtuali, senza acquisti.</span></div>`;
  const stages = `<ul class="list">${milestones(state)
    .map(
      (stage) =>
        `<li class="list-row items-center px-0">${avatar(icon(stage.done ? "check" : stage.icon), stage.done ? "bg-primary/15 text-primary" : "bg-base-200")}<div class="min-w-0"><strong class="block font-semibold">${stage.title}</strong><p class="mt-1 text-xs text-base-content/85">${stage.detail}</p></div><span class="badge ${stage.done ? "badge-success" : "badge-ghost"}">${stage.done ? "Raggiunta" : stage.count}</span></li>`,
    )
    .join(
      "",
    )}</ul><p class="text-xs text-base-content/85">Le tappe raccontano le attività registrate. Non misurano la salute e non assegnano foglie aggiuntive.</p>`;
  return `${heading("Le buone abitudini mettono radici.", "Un giardino che racconta il tuo percorso.", pointsPill(state))}<div class="grid items-start gap-6 @4xl:grid-cols-2">${card("Il tuo Alberello", tree, decorations, "bg-primary/15")}${card("Le tue ricompense", rewardBody, link("ricompense", "Esplora tutte le collezioni"))}</div><div class="mt-6">${card("Le tappe del tuo percorso", stages, link("evoluzione", "Il percorso di crescita"))}</div>`;
}

const dateLabel = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
});
const numberLabel = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});
export function progress({ state, ui }) {
  const report = habitReport(state, ui.progress.category, ui.progress.period),
    config = habitLabels[report.type];
  const goal = config.goal ? state.goals[config.goal] : null;
  const max = Math.max(goal || 1, ...report.values),
    points = totalPoints(state);
  const registered = report.dates.map((date) =>
    state.entries.some(
      (entry) => entry.type === report.type && entry.date === date,
    ),
  );
  const shownDates = report.dates
    .map((date, index) => ({ date, index }))
    .filter(({ index }) => report.period === 7 || registered[index]);
  const dailyRows = shownDates
    .map(({ date, index }) => {
      const label = dateLabel.format(new Date(date + "T12:00:00"));
      return `<li class="list-row grid-cols-[3.5rem_1fr_auto] items-center px-0 py-3"><span class="text-xs ${date === localDate() ? "font-bold" : ""}">${label}</span>${registered[index] ? `<progress class="progress progress-primary w-full" value="${report.values[index]}" max="${max}" aria-label="${config.label} del ${date}: ${numberLabel.format(report.values[index])} ${config.unit}"></progress><span class="text-xs tabular-nums">${numberLabel.format(report.values[index])} ${config.unit}</span>` : '<span class="col-span-2 text-right text-xs text-base-content/85">Nessuna registrazione</span>'}</li>`;
    })
    .join("");
  const gaps = [];
  report.dates.forEach((date, index) => {
    if (registered[index]) return;
    const previous = gaps.at(-1);
    if (previous && previous.lastIndex === index - 1) {
      previous.end = date;
      previous.lastIndex = index;
      previous.count++;
    } else gaps.push({ start: date, end: date, lastIndex: index, count: 1 });
  });
  const missingDays = report.period - report.registeredDays;
  const missingDetail =
    report.period === 30 && missingDays
      ? `<details class="collapse collapse-arrow bg-base-200"><summary class="collapse-title min-h-11 py-3 text-sm font-semibold">${missingDays} ${missingDays === 1 ? "giorno senza registrazioni" : "giorni senza registrazioni"}</summary><div class="collapse-content"><p class="text-xs text-base-content/85">Qui non hai registrato questa abitudine: non è un valore pari a zero.</p><ul class="list">${gaps
          .map((gap) => {
            const start = dateLabel.format(new Date(gap.start + "T12:00:00"));
            const end = dateLabel.format(new Date(gap.end + "T12:00:00"));
            return `<li class="list-row grid-cols-[1fr_auto] gap-3 px-0 py-3 text-xs"><span>${start}${gap.count > 1 ? ` – ${end}` : ""}</span><span>${gap.count} ${gap.count === 1 ? "giorno" : "giorni"}</span></li>`;
          })
          .join("")}</ul></div></details>`
      : "";
  const filters = `<div class="grid gap-3 sm:grid-cols-2"><fieldset class="fieldset"><legend class="fieldset-legend">Abitudine</legend><label class="sr-only" for="progress-category">Abitudine da esplorare</label><select id="progress-category" class="select border-secondary/75 w-full">${Object.entries(
    habitLabels,
  )
    .map(
      ([key, value]) =>
        `<option value="${key}" ${key === report.type ? "selected" : ""}>${value.label}</option>`,
    )
    .join(
      "",
    )}</select></fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Periodo</legend><label class="sr-only" for="progress-period">Periodo dei progressi</label><select id="progress-period" class="select border-secondary/75 w-full"><option value="7" ${report.period === 7 ? "selected" : ""}>Ultimi 7 giorni</option><option value="30" ${report.period === 30 ? "selected" : ""}>Ultimi 30 giorni</option></select></fieldset></div>`;
  const chart = `${filters}${stats([
    [
      numberLabel.format(
        report.type === "sleep" ? report.average : report.total,
      ),
      report.type === "sleep"
        ? "ore medie nelle notti registrate"
        : `${config.unit} nel periodo`,
    ],
    [report.registeredDays, "giorni registrati", `su ${report.period} giorni`],
  ])}${!report.registeredDays ? `<p class="text-sm text-base-content/85">Le attività che aggiungi al diario compariranno qui. I giorni senza una registrazione non hanno un valore rilevato.</p>` : ""}${dailyRows ? `<ul class="list">${dailyRows}</ul>` : ""}${missingDetail}<p class="text-xs text-base-content/85">${goal ? `Obiettivo personale: ${goal} ${config.unit} al giorno. ` : ""}${report.type === "sleep" ? "Se hai più registrazioni nello stesso giorno, viene usata l’ultima." : "Le quantità sommano le registrazioni di ogni giorno."}</p>`;
  const tree = `<figure>${alberello(state, "size-28 sm:size-36")}</figure>${stats(
    [
      [points, "foglie raccolte"],
      [Math.floor(points / 100) + 1, "livello di crescita"],
    ],
  )}<progress class="progress progress-primary w-full" value="${points % 100}" max="100" aria-label="Progressi di Alberello"></progress><p class="text-sm text-base-content/85">Le foglie celebrano la costanza. Non misurano la tua salute o la glicemia.</p>`;
  const learning = `<ul class="list">${Object.entries(quizSets)
    .map(([category, quiz]) => {
      const result = quizSummary(state, category);
      return `<li class="list-row items-center px-0">${avatar(icon(result.completed ? "check" : "book-open"))}<div class="min-w-0"><strong class="block font-semibold">${quiz.title}</strong><p class="mt-1 text-xs text-base-content/85">${result.best !== null ? `Migliore nello storico: ${result.best}/3 · ${result.attempts} ${result.attempts === 1 ? "tentativo conservato" : "tentativi conservati"}` : result.completed ? "Quiz già completato nel tuo percorso" : "Tre domande da esplorare"}</p></div><a class="btn btn-outline btn-sm min-h-11" href="#quiz/${category}">${result.completed ? "Riprova" : "Inizia"}<span class="sr-only"> · ${quiz.title}</span></a></li>`;
    })
    .join(
      "",
    )}</ul><p class="text-xs text-base-content/85">Lo storico conserva gli ultimi 200 tentativi complessivi. I risultati si riferiscono ai tentativi ancora presenti; le foglie già raccolte restano nel percorso.</p>`;
  return `${heading("Guarda quanta strada hai fatto.", "I tuoi progressi, a partire dai gesti che hai registrato.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card(`Il tuo ${report.type === "sleep" ? "riposo" : report.type === "water" ? "diario dell’acqua" : report.type === "mindful" ? "tempo per te" : "movimento"}`, chart, link("diario", "Apri il diario"))}${card("Il percorso di Alberello", tree, link("evoluzione", "Dettaglio della crescita"))}</div><div class="mt-6">${card("Le tue scoperte", learning)}</div><div class="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3"><h2>Le tue abitudini, in tutto il percorso</h2>${link("diario", "Apri il diario")}</div><div class="grid grid-cols-2 gap-4 @4xl:grid-cols-4">${[
    ["meal", "chart-pie", "Pasti registrati"],
    ["movement", "bolt", "Attività registrate"],
    ["sleep", "moon", "Registrazioni di sonno"],
    ["mindful", "face-smile", "Pause per te"],
  ]
    .map(
      ([type, sym, label]) =>
        `<div class="stats bg-base-100"><div class="stat min-w-0 p-5"><div class="stat-title flex items-center gap-2 whitespace-normal text-xs text-base-content/85">${icon(sym)}<span class="min-w-0 break-words">${label}</span></div><div class="stat-value mt-3 font-serif text-3xl font-medium">${state.entries.filter((entry) => entry.type === type).length}</div><div class="stat-desc whitespace-normal text-base-content/85">nel tuo percorso</div></div></div>`,
    )
    .join("")}</div>`;
}
