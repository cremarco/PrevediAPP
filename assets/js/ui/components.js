import { icons } from "../../icons.js";

import { availablePoints, rewards } from "../../data.js";

import { wellnessPalette, entryCategory } from "../config.js";

// Pure HTML helpers. Native daisyUI structure and Terra classes are preserved.

export const icon = (name, cls = "") => {
  const symbol = Object.hasOwn(icons, name) ? name : "question-mark-circle",
    size = /(?:^|\s)size-/.test(cls) ? "" : "size-5";
  return `<svg class="${size} shrink-0 ${cls}" data-heroicon="${symbol}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[symbol]}</svg>`;
};

export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export const avatar = (content, skin = "bg-primary/10") =>
  `<div class="avatar avatar-placeholder"><div class="w-10 rounded-full ${skin}"><span>${content}</span></div></div>`;

export const titleRow = (title, action = "", id = "") =>
  `<div class="flex flex-wrap items-center justify-between gap-3"><h2 class="card-title font-serif text-xl font-medium" ${id ? `id="${id}"` : ""}>${title}</h2>${action}</div>`;

const illustrationSubjects = {
  alimentazione: "nutrition",
  attivita: "movement",
  sonno: "sleep",
  stress: "calm",
  diario: "journal",
  community: "community",
};

// Decorative, local assets: controls keep their own Heroicons and accessible names.
export function illustration(
  kind,
  cls = "size-16 min-[480px]:size-24 sm:size-36",
) {
  if (!Object.hasOwn(illustrationSubjects, kind)) return "";
  return `<img src="assets/images/scene-${illustrationSubjects[kind]}-v1.webp" alt="" width="512" height="512" class="${cls} shrink-0 object-contain" loading="lazy" decoding="async" data-illustration="${kind}">`;
}

export const illustratedTitle = (title, kind) =>
  `<div class="flex items-center gap-4"><h2 class="card-title min-w-0 flex-1 font-serif text-xl font-medium">${title}</h2><figure class="shrink-0">${illustration(kind, "size-12 sm:size-20")}</figure></div>`;

export const card = (
  title,
  body,
  actions = "",
  skin = "bg-base-100",
  attrs = "",
  scene = "",
) =>
  `<section class="card card-border min-w-0 ${scene ? "card-side" : ""} ${skin}" ${attrs}>${scene ? `<figure class="shrink-0 pl-4 sm:pl-6">${illustration(scene)}</figure>` : ""}<div class="card-body min-w-0 gap-5 p-5 sm:p-6">${title ? titleRow(title) : ""}${body}${actions ? `<div class="card-actions items-center gap-3">${actions}</div>` : ""}</div></section>`;

export const link = (route, label, symbol = "arrow-right") =>
  `<a class="btn btn-ghost h-auto min-h-11 justify-start px-0 text-base-content" href="#${route}">${label}${icon(symbol)}</a>`;

export const resourceMenu = (items) =>
  `<ul class="menu w-full gap-1 p-0">${items.map(([route, sym, title, desc]) => `<li><a class="grid min-h-14 grid-cols-[auto_1fr_auto] gap-3 px-2 py-3" href="#${route}">${icon(sym)}<span class="min-w-0"><strong class="block font-semibold">${title}</strong><span class="mt-1 block text-xs text-base-content/85">${desc}</span></span>${icon("chevron-right")}</a></li>`).join("")}</ul>`;

export const field = (label, control) =>
  `<label class="label flex-col items-start gap-2 whitespace-normal text-sm text-base-content"><span>${label}</span>${control}</label>`;

export const stats = (items) =>
  `<div class="stats stats-vertical w-full bg-base-200 sm:stats-horizontal">${items.map(([value, title, desc = ""]) => `<div class="stat min-w-0 p-4"><div class="stat-title whitespace-normal text-base-content/85">${title}</div><div class="stat-value font-serif text-3xl font-medium">${value}</div>${desc ? `<div class="stat-desc whitespace-normal text-base-content/85">${desc}</div>` : ""}</div>`).join("")}</div>`;

export const pointsPill = (state) =>
  `<span class="badge badge-accent badge-lg whitespace-nowrap">${icon("star", "size-4")}${availablePoints(state)} foglie</span>`;

export function alberello(state, cls = "h-64 w-64 sm:h-72 sm:w-72") {
  const reward = rewards.find(
    (item) => item.id === state.decoration && state.claimed.includes(item.id),
  );
  return `<img class="${cls} object-contain" src="assets/images/${reward ? `garden-${reward.id}.webp` : "alberello-original.png"}" alt="${reward ? `Alberello · ${reward.name}` : "Alberello, un abete sorridente che ti saluta"}" width="${reward ? 640 : 422}" height="${reward ? 640 : 422}">`;
}

export function heading(title, description, actions = "") {
  return `<div class="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-7"><div class="min-w-0 max-w-full"><h1 class="break-words [overflow-wrap:anywhere]">${title}</h1>${description ? `<p class="mt-2 max-w-[72ch] text-base-content/85">${description}</p>` : ""}</div>${actions ? `<div class="flex min-w-0 max-w-full flex-wrap items-center gap-2">${actions}</div>` : ""}</div>`;
}

export function empty(title, text, action = "") {
  return `<div class="flex flex-col items-center gap-3 py-8 text-center">${avatar(icon("clipboard-document-list"))}<h3>${title}</h3><p class="max-w-md text-sm text-base-content/85">${text}</p>${action}</div>`;
}

export function entryDetails(e) {
  if (e.type === "movement") {
    const minutes = Number(e.minutes) || 0;
    return `${minutes} ${minutes === 1 ? "minuto" : "minuti"}`;
  }
  if (e.type === "sleep")
    return `${Number(e.hours) || 0} ${Number(e.hours) === 1 ? "ora" : "ore"} · ${esc(e.quality || "")}`;
  if (e.type === "mindful") {
    const minutes = Number(e.minutes) || 1;
    return `${minutes} ${minutes === 1 ? "minuto" : "minuti"} di respirazione`;
  }
  if (e.type === "water") return "1 bicchiere";
  return esc(e.meal || "Pasto");
}

export function entryList(entries, { title, text, action = "" } = {}) {
  return entries.length
    ? `<ul class="list">${[...entries]
        .reverse()
        .map(
          (e) =>
            `<li class="list-row items-center px-0">${avatar(icon({ meal: "chart-pie", movement: "bolt", sleep: "moon", mindful: "face-smile", water: "beaker" }[e.type]), wellnessPalette[entryCategory[e.type] || "alimentazione"].avatar)}<div class="min-w-0"><strong class="block break-words font-semibold [overflow-wrap:anywhere]">${esc(e.label || { sleep: "Il mio riposo", mindful: "Pausa di respirazione", water: "Un bicchiere d’acqua" }[e.type])}</strong><span class="mt-1 block text-xs text-base-content/85">${entryDetails(e)}</span>${e.notes ? `<p class="mt-2 whitespace-pre-wrap break-words text-xs text-base-content/85 [overflow-wrap:anywhere]">${esc(e.notes)}</p>` : ""}</div><div class="flex flex-col sm:flex-row"><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="edit-entry" data-id="${esc(e.id)}" aria-label="Modifica ${esc(e.label || "registrazione")}">${icon("pencil-square")}</button><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="delete-entry" data-id="${esc(e.id)}" aria-label="Elimina ${esc(e.label || "registrazione")}">${icon("trash")}</button></div></li>`,
        )
        .join("")}</ul>`
    : empty(
        title || "Il diario aspetta il tuo primo passo",
        text || "Le tue attività compariranno qui dopo averle registrate.",
        action,
      );
}
