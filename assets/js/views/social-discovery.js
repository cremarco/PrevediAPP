import { localDate } from "../../data.js";
import {
  groups,
  groupCategories,
  filterGroups,
  challenges as challengeCatalog,
  challengeProgress,
  communityPeople,
} from "../social-catalog.js";
import {
  icon,
  esc,
  heading,
  card,
  link,
  avatar,
  resourceMenu,
  empty,
  illustration,
} from "../ui/components.js";

const demoNotice = (text) =>
  `<div class="alert alert-info alert-soft mb-6" role="note">${icon("information-circle")}<span>${text}</span></div>`;
const joinedGroups = (state) =>
  Array.isArray(state.joined) ? state.joined : [];

const joinButton = (state, group) => {
  const joined = joinedGroups(state).includes(group.id);
  return `<button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal ${joined ? "btn-active" : ""}" data-action="join-group" data-id="${group.id}" aria-pressed="${joined}">${icon(joined ? "check" : "plus")}${joined ? "Esci dal gruppo" : "Unisciti nella demo"}<span class="sr-only"> · ${group.name}</span></button>`;
};

export function groupsCatalog({ state, ui }) {
  const social = ui.social || {};
  const query = typeof social.query === "string" ? social.query : "";
  const category = Object.hasOwn(groupCategories, social.category)
    ? social.category
    : "all";
  const found = filterGroups(query, category);
  const selected = groups.filter((group) =>
    joinedGroups(state).includes(group.id),
  );
  const filters = `<form id="groups-search-form" class="grid gap-3"><div class="grid gap-3 sm:grid-cols-2"><fieldset class="fieldset"><legend class="fieldset-legend">Cerca un gruppo</legend><label class="sr-only" for="group-search">Nome o tema del gruppo</label><input id="group-search" name="query" type="search" class="input border-secondary/75 placeholder:text-base-content/85 w-full" value="${esc(query)}" maxlength="80" placeholder="Es. movimento o calma"></fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Esplora un tema</legend><label class="sr-only" for="group-category">Tema dei gruppi</label><select id="group-category" name="category" class="select border-secondary/75 w-full">${Object.entries(
    groupCategories,
  )
    .map(
      ([id, label]) =>
        `<option value="${id}" ${id === category ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></fieldset></div><button class="btn btn-primary min-h-11 justify-self-start" type="submit">Cerca gruppi ${icon("arrow-right")}</button></form>`;
  const rows = found.length
    ? `<p class="text-xs text-base-content/85" role="status">${found.length} ${found.length === 1 ? "gruppo trovato" : "gruppi trovati"}</p><ul class="list">${found.map((group) => `<li class="list-row grid-cols-[auto_minmax(0,1fr)] items-start px-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]">${avatar(icon(group.icon))}<div class="min-w-0"><h3>${group.name}</h3><span class="badge badge-ghost badge-sm mt-2">${groupCategories[group.category]}</span><p class="mt-3 text-sm text-base-content/85">${group.description}</p>${link(`gruppo/${group.id}`, "Esplora il gruppo")}</div><div class="list-col-wrap col-span-2 col-start-1 sm:col-span-1 sm:col-start-3 sm:row-start-1">${joinButton(state, group)}</div></li>`).join("")}</ul>`
    : empty(
        "Nessun gruppo per questa ricerca",
        "Prova un’altra parola o esplora tutti i temi.",
        '<button class="btn btn-outline min-h-11" data-action="group-clear-filter">Mostra tutti i gruppi</button>',
      );
  const own = selected.length
    ? resourceMenu(
        selected.map((group) => [
          `gruppo/${group.id}`,
          group.icon,
          group.name,
          "Preferenza salvata in questo browser",
        ]),
      )
    : `<p class="text-sm text-base-content/85">Quando scegli un gruppo della demo, lo ritrovi qui. Puoi uscirne in qualsiasi momento.</p>`;
  return `${heading("Trova il tuo piccolo gruppo.", "Temi da esplorare, idee da portare nel tuo percorso.", link("community", "Community", "arrow-left"))}${demoNotice("Gruppi dimostrativi: la tua scelta resta in questo browser. Nessun messaggio viene inviato ad altre persone.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1.6fr_1fr]">${card("Gruppi della community", filters + rows)}<aside class="grid gap-6">${card("I tuoi gruppi", own)}${card("Un bosco da esplorare", `<figure>${illustration("community", "mx-auto size-28 sm:size-36")}</figure><p class="text-sm text-base-content/85">Un incoraggiamento simbolico o una sfida personale possono accompagnare le attività che registri.</p>`, `${link("giardino-community", "Visita il giardino")}${link("sfide", "Esplora le sfide")}`, "bg-primary/15")}</aside></div>`;
}

export function groupDetail({ state, ui }) {
  const group = groups.find((item) => item.id === ui.social?.groupId);
  if (!group)
    return `${heading("Questo gruppo non è disponibile.", "Esplora i gruppi presenti nella demo.")}${card("", link("gruppi", "Torna ai gruppi", "arrow-left"))}`;
  const prompts = `<p class="text-sm text-base-content/85">${group.description}</p><ul class="list">${group.prompts.map((text) => `<li class="list-row grid-cols-[auto_1fr] items-start px-0">${icon("book-open")}<p class="text-sm">${text}</p></li>`).join("")}</ul>`;
  return `${heading(group.name, groupCategories[group.category], link("gruppi", "Tutti i gruppi", "arrow-left"))}${demoNotice("Questo è un gruppo di esempio. Entrare o uscire salva una preferenza locale; non apre una chat con altre persone.")}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("Spunti da portare con te", prompts, joinButton(state, group))}${card("Esplora nel tuo percorso", resourceMenu(group.resources), link("community", "Racconta un pensiero nella demo"))}</div>`;
}

export function challenges({ state }) {
  const selected = Array.isArray(state.joinedChallenges)
    ? state.joinedChallenges
    : [];
  const challengeCard = (challenge) => {
    const progress = challengeProgress(state, challenge.id);
    const joined = selected.includes(challenge.id);
    const body = `<div class="flex items-start justify-between gap-4"><div class="min-w-0"><h2 class="card-title font-serif text-xl font-medium">${challenge.title}</h2><p class="mt-3 text-sm text-base-content/85">${challenge.description}</p></div><figure class="shrink-0">${illustration(challenge.scene, "size-16 sm:size-20")}</figure></div><div><div class="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span>${progress.current}/${progress.target} ${progress.unit}</span><span>${progress.detail}</span></div><progress class="progress progress-primary w-full" value="${Math.min(progress.current, progress.target)}" max="${progress.target}" aria-label="${challenge.title}: ${progress.current} di ${progress.target} ${progress.unit}"></progress></div><span class="badge ${progress.done ? "badge-success" : "badge-ghost"} self-start">${progress.done ? "Obiettivo registrato" : "Un gesto alla volta"}</span>`;
    const actions = `${link(challenge.route, "Coltiva questa abitudine")}<button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal ${joined ? "btn-active" : ""}" data-action="challenge-join" data-id="${challenge.id}" aria-pressed="${joined}">${icon(joined ? "check" : "plus")}${joined ? "Rimuovi dalle mie sfide" : "Aggiungi alle mie sfide"}<span class="sr-only"> · ${challenge.title}</span></button>`;
    return card("", body, actions);
  };
  const active = challengeCatalog.filter((challenge) =>
    selected.includes(challenge.id),
  );
  const available = challengeCatalog.filter(
    (challenge) => !selected.includes(challenge.id),
  );
  return `${heading("Una sfida, al tuo ritmo.", "Piccoli obiettivi raccontati dalle attività del tuo diario.", link("community", "Community", "arrow-left"))}${demoNotice("Le sfide restano personali in questa demo. Non ci sono classifiche o punteggi condivisi; partecipare non assegna foglie aggiuntive.")}<h2 class="mb-4">Le mie sfide</h2>${active.length ? `<div class="grid items-start gap-6 @4xl:grid-cols-2">${active.map(challengeCard).join("")}</div>` : card("", empty("Scegli la prima sfida", "Aggiungi un tema qui sotto per ritrovarlo nel tuo percorso."))}${available.length ? `<h2 class="mt-8 mb-4">Esplora le sfide</h2><div class="grid items-start gap-6 @4xl:grid-cols-2">${available.map(challengeCard).join("")}</div>` : ""}<p class="mt-6 max-w-[72ch] text-xs text-base-content/85">I progressi considerano le registrazioni già presenti nel periodo indicato, anche prima di scegliere una sfida. Più pause o attività nello stesso giorno contano come un solo giorno; i pasti contano singolarmente. L’acqua segue l’obiettivo che hai scelto nel profilo.</p>`;
}

export function communityGarden({ state, ui }) {
  const watered = Array.isArray(state.watered) ? state.watered : [];
  const query =
    typeof ui?.social?.friendsQuery === "string"
      ? ui.social.friendsQuery.trim().slice(0, 80)
      : "";
  const found = communityPeople.filter((person) =>
    `${person.name} ${person.description}`
      .toLocaleLowerCase("it-IT")
      .includes(query.toLocaleLowerCase("it-IT")),
  );
  const people = found
    .map((person) => {
      const done = watered.includes(`${localDate()}:${person.id}`);
      const body = `<div class="flex items-center gap-3"><div class="avatar"><div class="w-12 rounded-full bg-base-200"><img src="${person.avatar}" alt="" width="1254" height="1254" loading="lazy" decoding="async"></div></div><div class="min-w-0"><h2 class="card-title font-serif text-xl font-medium">${person.name}</h2><p class="mt-1 text-xs text-base-content/85">${person.description}</p></div></div><figure><img src="assets/images/alberello-original.png" alt="Alberello di esempio di ${person.name}" width="422" height="422" class="mx-auto size-40 object-contain sm:size-48" loading="lazy" decoding="async"></figure><p class="text-center text-xs text-base-content/85">Persona e giardino di esempio</p>`;
      return card(
        "",
        body,
        `<button class="btn btn-outline min-h-11 w-full" data-action="water-tree" data-id="${person.id}" ${done ? "disabled" : ""}>${icon(done ? "check" : "hand-thumb-up")}${done ? "Incoraggiato per oggi" : "Innaffia con un incoraggiamento"}</button>`,
      );
    })
    .join("");
  const search = `<form id="garden-friends-form" class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"><fieldset class="fieldset min-w-0 flex-1"><legend class="fieldset-legend">Trova una persona nella demo</legend><label class="sr-only" for="garden-friends-query">Nome o interesse della persona</label><input id="garden-friends-query" name="query" type="search" class="input border-secondary/75 placeholder:text-base-content/85 w-full" maxlength="80" value="${esc(query)}" placeholder="Es. Anna o calma"></fieldset><button type="submit" class="btn btn-primary min-h-11">Cerca nel giardino</button></form>`;
  return `${heading("Il giardino della community.", "Un piccolo gesto simbolico per chi cammina con te.", link("community", "Community", "arrow-left"))}${demoNotice("Questi giardini sono dimostrativi. Innaffiare salva un incoraggiamento solo nel tuo browser, una volta al giorno per persona.")}${search}${found.length ? `<div class="grid items-start gap-6 @3xl:grid-cols-3">${people}</div>` : card("", empty("Nessuna persona per questa ricerca", "Prova Anna, Marco o Elena, oppure lascia vuoto il campo e cerca di nuovo."))}<div class="mt-6">${card("Un invito a esplorare", `<p class="max-w-[72ch] text-sm text-base-content/85">Puoi mostrare questa demo a chi vuoi condividendo l’indirizzo del sito. Ogni persona avrà un percorso separato nel proprio browser; qui non ci sono inviti o richieste di amicizia.</p>`, `${link("gruppi", "Trova un gruppo")}${link("giardino", "Il mio giardino")}`)}</div>`;
}
