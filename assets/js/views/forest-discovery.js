import { totalPoints, availablePoints, rewards } from "../../data.js";
import { milestones } from "../insights.js";
import {
  icon,
  esc,
  heading,
  card,
  link,
  alberello,
  pointsPill,
  avatar,
} from "../ui/components.js";

const stages = [
  { level: 1, name: "Germoglio", description: "Un nuovo inizio", icon: "sun" },
  { level: 2, name: "Piantina", description: "Le prime radici", icon: "home" },
  {
    level: 4,
    name: "Alberello",
    description: "Un percorso che cresce",
    icon: "arrow-trending-up",
  },
  {
    level: 5,
    name: "Albero grande",
    description: "Nuovi rami da coltivare",
    icon: "sparkles",
  },
];

export function evolution({ state }) {
  const points = totalPoints(state);
  const level = Math.floor(points / 100) + 1;
  const current = stages.findLast((stage) => stage.level <= level);
  const tree = `<figure>${alberello(state)}</figure><h2 class="text-center">${current.name}</h2><p class="text-center text-sm text-base-content/85">Livello ${level} · ${points} foglie raccolte nel tuo percorso</p><div><div class="mb-2 flex justify-between gap-3 text-xs text-base-content/85"><span>Verso il livello ${level + 1}</span><span>${points % 100}/100 foglie</span></div><progress class="progress progress-primary w-full" value="${points % 100}" max="100" aria-label="Crescita di Alberello verso il livello ${level + 1}"></progress></div><p class="text-xs text-base-content/85">Ogni livello richiede 100 foglie raccolte. Usarle per una decorazione conserva la crescita raggiunta.</p>`;
  const growth = `<ul class="list">${stages.map((stage) => `<li class="list-row items-start px-0">${avatar(icon(stage.level <= level ? "check" : stage.icon), stage.level <= level ? "bg-primary/15 text-primary" : "bg-base-200")}<div class="min-w-0"><h3>${stage.name}</h3><p class="mt-1 text-xs text-base-content/85">${stage.description} · dal livello ${stage.level}</p></div><span class="badge ${stage.level <= level ? "badge-success" : "badge-ghost"}">${stage.level <= level ? "Raggiunto" : `Liv. ${stage.level}`}</span></li>`).join("")}</ul><p class="text-xs text-base-content/85">I nomi delle tappe raccontano il gioco. Nel giardino ritrovi le decorazioni e gli accessori che scegli per Alberello.</p>`;
  const achievements = `<ul class="list">${milestones(state)
    .map(
      (stage) =>
        `<li class="list-row grid-cols-[auto_minmax(0,1fr)_auto] items-start px-0">${icon(stage.done ? "check" : stage.icon)}<div class="min-w-0"><h3>${stage.title}</h3><p class="mt-1 text-xs text-base-content/85">${stage.detail}</p></div><span class="badge ${stage.done ? "badge-success" : "badge-ghost"}">${stage.done ? "Raggiunta" : stage.count}</span></li>`,
    )
    .join("")}</ul>`;
  return `${heading("Alberello cresce con te.", "Foglie, tappe e piccoli gesti che hai registrato.", link("progressi", "I miei progressi", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-2">${card("Il tuo Alberello", tree, link("giardino", "Scegli il tuo giardino"), "bg-primary/15")}${card("Percorso di crescita", growth)}</div><div class="mt-6">${card("Le tappe che raccontano le tue attività", achievements, link("diario", "Continua dal diario"))}</div><p class="mt-6 max-w-[72ch] text-xs text-base-content/85">Livelli e foglie celebrano le attività del percorso. Non misurano glicemia, vitalità o risultati di salute.</p>`;
}

export function rewardCollections({ state, ui }) {
  const selected = ["nature", "winter"].includes(ui?.forest?.theme)
    ? ui.forest.theme
    : "all";
  const owned = Array.isArray(state.claimed) ? state.claimed : [];
  const available = availablePoints(state);
  const themeFor = (reward) =>
    reward.theme === "winter" ? "winter" : "nature";
  const shown = rewards.filter(
    (reward) => selected === "all" || themeFor(reward) === selected,
  );
  const filters = `<fieldset class="fieldset max-w-sm"><legend class="fieldset-legend">Esplora una collezione</legend><label class="sr-only" for="reward-theme">Collezione di ricompense</label><select id="reward-theme" class="select border-secondary/75 w-full"><option value="all" ${selected === "all" ? "selected" : ""}>Tutte le ricompense</option><option value="nature" ${selected === "nature" ? "selected" : ""}>Natura</option><option value="winter" ${selected === "winter" ? "selected" : ""}>Inverno</option></select></fieldset>`;
  const collection = shown
    .map((reward) => {
      const claimed = owned.includes(reward.id);
      const active = claimed && state.decoration === reward.id;
      const missing = Math.max(0, reward.cost - available);
      const body = `<figure><img src="${esc(reward.image || `assets/images/garden-${reward.id}.webp`)}" alt="${esc(reward.name)}" width="640" height="640" class="mx-auto size-40 object-contain sm:size-48" loading="lazy" decoding="async"></figure><div><span class="badge badge-ghost badge-sm">${themeFor(reward) === "winter" ? "Inverno" : "Natura"}</span><h2 class="card-title mt-3 font-serif text-xl font-medium">${esc(reward.name)}</h2><p class="mt-2 text-sm text-base-content/85">${esc(reward.description)}</p></div><p class="text-sm">${claimed ? "Questa ricompensa è nel tuo giardino." : `${reward.cost} foglie · ${missing ? `ne mancano ${missing}` : "puoi sbloccarla"}`}</p>`;
      const action = `<button class="btn btn-outline min-h-11 w-full" data-action="${claimed ? "decorate" : "claim"}" data-id="${esc(reward.id)}" ${active || (!claimed && missing) ? "disabled" : ""}>${icon(active ? "check" : claimed ? "sun" : "gift")}${active ? "In uso nel giardino" : claimed ? "Usa nel mio giardino" : "Sblocca la ricompensa"}</button>`;
      return card("", body, action);
    })
    .join("");
  return `${heading("Le tue ricompense.", "Natura e piccoli dettagli per rendere Alberello tuo.", pointsPill(state))}<div class="mb-6 flex flex-wrap items-end justify-between gap-4">${filters}${link("giardino", "Il mio giardino", "arrow-left")}</div>${shown.length ? `<div class="grid items-start gap-6 @3xl:grid-cols-2 @5xl:grid-cols-3">${collection}</div>` : card("Una collezione da ritrovare", `<p class="text-sm text-base-content/85">Questa collezione non contiene ancora ricompense nel catalogo locale. Scegli “Tutte le ricompense” per esplorare quelle disponibili.</p>`)}<div class="alert alert-info alert-soft mt-6" role="note">${icon("information-circle")}<span>${totalPoints(state)} foglie raccolte · ${available} disponibili. Le ricompense sono virtuali, senza acquisti o altre valute; sbloccarle non riduce il livello raggiunto.</span></div>`;
}
