import { localDate } from "../../data.js";
import {
  icon,
  esc,
  heading,
  avatar,
  card,
  field,
  illustration,
  resourceMenu,
} from "../ui/components.js";

const communityAvatars = {
  anna: "assets/images/avatar-anna.webp",
  marco: "assets/images/avatar-marco.webp",
  elena: "assets/images/avatar-elena.webp",
};
const communityAvatar = (id, name) =>
  Object.hasOwn(communityAvatars, id)
    ? `<div class="avatar" data-community-avatar="${id}"><div class="w-10 rounded-full bg-base-200"><img src="${communityAvatars[id]}" alt="" width="1254" height="1254" loading="lazy" decoding="async"></div></div>`
    : avatar(esc(name.slice(0, 1)));

const postDate = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
});
export function community({ state, ui }) {
  const groups = [
    {
      id: "walkers",
      name: "Un passo nel verde",
      members: 24,
      desc: "Un gruppo per chi ama camminare e trovare nuove idee per muoversi.",
    },
    {
      id: "cooks",
      name: "Il piatto delle idee",
      members: 18,
      desc: "Ingredienti di stagione, abbinamenti e piccoli esperimenti in cucina.",
    },
  ];
  const groupCards = groups
    .map((g) =>
      card(
        g.name,
        `<p class="text-xs text-base-content/85">${g.members + (state.joined.includes(g.id) ? 1 : 0)} partecipanti di esempio</p><p class="text-sm text-base-content/85">${g.desc}</p>`,
        `<button class="btn btn-outline h-auto min-h-11 max-w-full py-2 whitespace-normal ${state.joined.includes(g.id) ? "btn-primary btn-active" : ""}" data-action="join-group" data-id="${g.id}" aria-pressed="${state.joined.includes(g.id)}">${icon(state.joined.includes(g.id) ? "check" : "plus")}${state.joined.includes(g.id) ? "Nel tuo percorso · Esci" : "Unisciti al gruppo"}</button>`,
        "bg-base-100",
        "",
        g.id === "walkers" ? "attivita" : "alimentazione",
      ),
    )
    .join("");
  const people = `<div class="flex items-center gap-4"><figure class="shrink-0">${illustration("community", "size-20 sm:size-28")}</figure><p class="text-sm text-base-content/85">Un gesto simbolico per incoraggiare chi cammina con te.</p></div><ul class="list">${[
    ["anna", "Anna", "Una passeggiata alla volta"],
    ["marco", "Marco", "Nuove idee in cucina"],
    ["elena", "Elena", "Un momento di calma ogni giorno"],
  ]
    .map(
      ([id, name, text]) =>
        `<li class="list-row items-center px-0">${communityAvatar(id, name)}<div class="min-w-0"><strong class="block font-semibold">${name}</strong><span class="mt-1 block text-xs text-base-content/85">${text}</span></div><button class="btn btn-outline btn-sm min-h-11" data-action="water-tree" data-id="${id}" ${state.watered.includes(localDate() + ":" + id) ? "disabled" : ""}>${icon(state.watered.includes(localDate() + ":" + id) ? "check" : "hand-thumb-up")}${state.watered.includes(localDate() + ":" + id) ? "Innaffiato" : "Innaffia"}</button></li>`,
    )
    .join("")}</ul>`;
  const posts = `<ul class="list">${[
    [
      "post-1",
      "anna",
      "Anna",
      "Oggi ho scelto una strada diversa per la mia passeggiata. Ho scoperto un angolo verde che non conoscevo.",
    ],
    [
      "post-2",
      "marco",
      "Marco",
      "Il mio piatto di oggi: broccoli, riso integrale e tofu. Semplice e colorato!",
    ],
  ]
    .map(
      ([id, author, name, text]) =>
        `<li class="list-row px-0">${communityAvatar(author, name)}<div><strong class="block font-semibold">${name}</strong><span class="text-xs text-base-content/85">Messaggio di esempio</span></div><div class="list-col-wrap col-start-2 min-w-0"><p class="text-sm leading-relaxed">${text}</p><button class="btn btn-sm mt-3 min-h-11 ${state.likes.includes(id) ? "btn-outline btn-primary btn-active" : "btn-ghost"}" data-action="like-post" data-id="${id}" aria-pressed="${state.likes.includes(id)}">${icon("heart")}${state.likes.includes(id) ? "Ti piace" : "Incoraggia"}</button></div></li>`,
    )
    .join("")}</ul>`;
  const ownPosts = state.posts.length
    ? `<ul class="list">${[...state.posts]
        .reverse()
        .map((post) => {
          const date = new Date(post.createdAt);
          return `<li class="list-row grid-cols-[auto_minmax(0,1fr)] px-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]">${avatar(esc((state.name || "P").slice(0, 1).toUpperCase()))}<div class="min-w-0"><strong class="block break-words font-semibold [overflow-wrap:anywhere]">${esc(state.name || "Tu")}</strong><span class="text-xs text-base-content/85">Il tuo messaggio locale${Number.isFinite(date.getTime()) ? ` · ${postDate.format(date)}` : ""}</span></div><div class="list-col-wrap col-span-2 col-start-1 row-start-3 flex justify-end sm:col-span-1 sm:col-start-3 sm:row-start-1"><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="edit-post" data-id="${esc(post.id)}" aria-label="Modifica il tuo messaggio">${icon("pencil-square")}</button><button class="btn btn-ghost btn-circle min-h-11 min-w-11" data-action="delete-post" data-id="${esc(post.id)}" aria-label="Elimina il tuo messaggio">${icon("trash")}</button></div><p class="list-col-wrap col-span-2 col-start-1 row-start-2 sm:col-span-2 sm:col-start-2 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">${esc(post.text)}</p></li>`;
        })
        .join("")}</ul>`
    : "";
  const composer = `<form id="community-form"><fieldset class="fieldset gap-3"><legend class="fieldset-legend font-serif text-lg font-medium">${ui.community.editing ? "Modifica il tuo messaggio" : "Un pensiero per il piccolo bosco"}</legend>${field("Il tuo messaggio nella demo", `<textarea id="community-text" name="text" class="textarea border-secondary/75 placeholder:text-base-content/85 min-h-24 w-full" maxlength="400" required placeholder="Racconta un piccolo passo di oggi…" aria-describedby="community-count community-local">${esc(ui.community.draft)}</textarea>`)}<div class="flex flex-wrap justify-between gap-2 text-xs text-base-content/85"><span id="community-local">Resta sul tuo dispositivo. Non viene inviato a nessuno.</span><span id="community-count">${ui.community.draft.length}/400 caratteri</span></div><p id="community-error" class="alert alert-error alert-soft empty:hidden" role="alert"></p><div class="card-actions"><button class="btn btn-primary" type="submit">${icon("check")}${ui.community.editing ? "Salva le modifiche" : "Salva nella demo"}</button>${ui.community.editing ? '<button class="btn btn-ghost" type="button" data-action="cancel-post-edit">Annulla modifica</button>' : ""}</div></fieldset></form><div class="divider my-0"></div>`;
  return `${heading("Insieme, il percorso cresce.", "Idee, piccoli incoraggiamenti e un giardino condiviso.")}<div class="alert alert-info alert-soft mb-6" role="note">${icon("information-circle")}<span>Community dimostrativa: persone, gruppi e messaggi sono esempi. Le tue interazioni sono salvate solo sul tuo dispositivo.</span></div>${card(
    "Esplora la community",
    resourceMenu([
      [
        "gruppi",
        "user-group",
        "Gruppi della community",
        "Esplora temi e adesioni dimostrative",
      ],
      [
        "sfide",
        "star",
        "Sfide della community",
        "Obiettivi facoltativi dai tuoi gesti reali",
      ],
      [
        "giardino-community",
        "sun",
        "Giardino della community",
        "Un incoraggiamento nel bosco dimostrativo",
      ],
    ]),
  )}<div class="mt-6 grid gap-6 @4xl:grid-cols-2">${groupCards}</div><div class="mt-6 grid items-start gap-6 @4xl:grid-cols-2">${card("Il giardino della community", people)}${card("Dal nostro piccolo bosco", composer + ownPosts + posts)}</div>`;
}
