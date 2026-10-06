import { foods, quizSets, localDate } from "../../data.js";
import {
  heading,
  card,
  link,
  icon,
  esc,
  field,
  empty,
  illustratedTitle,
  resourceMenu,
} from "../ui/components.js";
import {
  foodCategories,
  findFoods,
  recipes,
  recipeById,
  searchRecipes,
  fridgeRounds,
} from "../nutrition-catalog.js";
import { formatTime } from "../timer.js";
import { quizSummary } from "../insights.js";
import { foodPicture } from "../ui/food-art.js";

const inputClass =
  "input min-h-11 w-full border-secondary/75 placeholder:text-base-content/85";
const back = () => link("alimentazione", "Alimentazione", "arrow-left");
export function recipeList({ state, ui }) {
  const d = ui.discovery,
    items = searchRecipes(d.recipeQuery, d.recipeFilter);
  const filters = `<form id="recipe-search-form" class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label class="sr-only" for="recipe-search">Cerca una ricetta</label><input id="recipe-search" name="query" class="${inputClass}" maxlength="80" value="${esc(d.recipeQuery)}" placeholder="Cerca una ricetta…"><button class="btn btn-outline min-h-11">${icon("magnifying-glass")}Cerca</button></form>${field("Tipo di ricetta", `<select id="recipe-filter" class="select min-h-11 w-full border-secondary/75">${["all", "Vegetale", "Pesce", "Preferite"].map((value) => `<option value="${value}" ${value === d.recipeFilter ? "selected" : ""}>${value === "all" ? "Tutte le ricette" : value}</option>`).join("")}</select>`)}`;
  const visible =
    d.recipeFilter === "Preferite"
      ? searchRecipes(d.recipeQuery).filter((r) =>
          state.recipeFavorites.includes(r.id),
        )
      : items;
  const rows = visible
    .map((r) =>
      card(
        r.name,
        `<p class="text-sm text-base-content/85">${r.minutes} min indicativi · ${r.tag}</p><p class="text-sm">${r.ingredients.slice(0, 3).map(esc).join(", ")}.</p>`,
        `<a class="btn btn-primary min-h-11" href="#ricetta/${r.id}">Vedi ricetta ${icon("arrow-right")}</a><button class="btn btn-ghost btn-circle size-11" data-action="recipe-favorite" data-id="${r.id}" aria-pressed="${state.recipeFavorites.includes(r.id)}" aria-label="${state.recipeFavorites.includes(r.id) ? "Rimuovi dalle" : "Aggiungi alle"} preferite ${r.name}">${icon("heart")}</button>`,
      ),
    )
    .join("");
  return `${heading("Ricette e benessere.", "Tre idee del prototipo, da adattare ai tuoi gusti.", back())}${card("", filters)}<p class="my-5 max-w-[72ch] text-sm text-base-content/85">Le preparazioni sono esempi per esplorare gli ingredienti. Tempi indicativi, senza stime di calorie o indicazioni personalizzate.</p><div class="grid items-start gap-5 @4xl:grid-cols-3">${rows || card("", empty("Nessuna ricetta in questo filtro", "Cambia il tipo o cerca un altro nome.", '<button class="btn btn-outline min-h-11" data-action="recipe-clear-filter">Mostra tutte le ricette</button>'))}</div><div class="mt-6">${resourceMenu(
    [
      [
        "giochi",
        "book-open",
        "Gioca e impara",
        "Esplora il piatto e gli ingredienti",
      ],
      [
        "guida-alimentazione",
        "chart-pie",
        "Mangia con equilibrio",
        "Ritrova il metodo del piatto",
      ],
    ],
  )}</div>`;
}
export function recipeDetail({ state, ui }) {
  const r = recipeById(ui.discovery.recipe);
  return `${heading(r.name, "Una preparazione da personalizzare.", link("ricette", "Ricette", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card("", `${illustratedTitle("Gli ingredienti", "alimentazione")}<p class="text-sm text-base-content/85">${r.minutes} minuti indicativi · ${r.tag}</p><ul class="list">${r.ingredients.map((text) => `<li class="list-row px-0"><span>${esc(text)}</span></li>`).join("")}</ul><p class="text-xs text-base-content/85">Scegli quantità e ingredienti secondo le tue esigenze, allergie e indicazioni del curante.</p>`, `<button class="btn btn-outline h-auto min-h-11 w-full max-w-full py-2 whitespace-normal" data-action="recipe-pantry" data-id="${r.id}">${icon("archive-box")}<span class="min-w-0">Aggiungi gli ingredienti alla dispensa</span></button>`)}${card("Prepariamola insieme", `<ol class="list">${r.steps.map((text, index) => `<li class="list-row grid-cols-[auto_minmax(0,1fr)] px-0"><span class="badge badge-soft badge-primary text-base-content">${index + 1}</span><p class="min-w-0 text-sm leading-relaxed">${esc(text)}</p></li>`).join("")}</ol>`, `<button class="btn btn-primary h-auto min-h-11 py-2 whitespace-normal" data-action="recipe-save" data-id="${r.id}">${icon("plus")}Racconta questo pasto</button><button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal" data-action="recipe-favorite" data-id="${r.id}" aria-pressed="${state.recipeFavorites.includes(r.id)}">${icon("heart")}${state.recipeFavorites.includes(r.id) ? "Nelle tue preferite" : "Salva tra le preferite"}</button>`)}</div>`;
}
export function foodSearch({ state, ui }, market = false) {
  const d = ui.discovery,
    items = findFoods(d.query, d.category);
  const filters = `<form id="food-search-form" class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label class="sr-only" for="food-query">Cerca un alimento</label><input id="food-query" name="query" class="${inputClass}" maxlength="80" value="${esc(d.query)}" placeholder="Es. mela, quinoa, yogurt…"><button class="btn btn-primary min-h-11">${icon("magnifying-glass")}Cerca</button></form>${field(
    "Categoria",
    `<select id="food-category" class="select min-h-11 w-full border-secondary/75">${Object.entries(
      foodCategories,
    )
      .map(
        ([id, name]) =>
          `<option value="${id}" ${id === d.category ? "selected" : ""}>${name}</option>`,
      )
      .join("")}</select>`,
  )}<p class="text-xs text-base-content/85">Catalogo locale: ${items.length} ${items.length === 1 ? "ingrediente" : "ingredienti"} nel filtro. Le categorie aiutano a esplorare il cibo; non sono un giudizio sulla tua salute.</p>`;
  const shelf = [...state.fridge, ...state.pantryExtras];
  const rows = items.length
    ? `<ul class="list">${items.map((food) => `<li class="list-row grid-cols-[minmax(0,1fr)_auto] items-start px-0"><div class="min-w-0"><strong>${esc(food.name)}</strong><p class="mt-1 text-xs text-base-content/85">${foodCategories[food.group]}</p></div><button class="btn btn-outline btn-circle size-11" data-action="${market ? "market-toggle" : "food-add"}" data-id="${food.id}" aria-label="${market ? (shelf.includes(food.id) ? "Rimuovi dalla" : "Aggiungi alla") + " dispensa" : "Racconta nel diario"} ${esc(food.name)}" ${market ? `aria-pressed="${shelf.includes(food.id)}"` : ""}>${icon(market && shelf.includes(food.id) ? "check" : "plus")}</button></li>`).join("")}</ul>`
    : empty(
        "Nessun ingrediente trovato",
        "Prova un nome più breve o togli il filtro.",
        '<button class="btn btn-outline min-h-11" data-action="food-clear-filter">Mostra tutto il catalogo</button>',
      );
  const recent = `${state.foodSearches.length ? `<div class="flex flex-wrap items-center justify-between gap-3"><h2>Ricerche recenti</h2><button class="btn btn-ghost min-h-11" data-action="food-clear-recent">Cancella ricerche</button></div><div class="mt-3 flex flex-wrap gap-2">${state.foodSearches.map((text) => `<button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal" data-action="food-recent" data-text="${esc(text)}">${esc(text)}</button>`).join("")}</div>` : ""}`;
  return `${heading(market ? "Il mercato del bosco." : "Cerca un alimento.", market ? "Esplora e conserva gli ingredienti nella tua dispensa." : "Trova un ingrediente da raccontare nel diario.", back())}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", `${filters}${rows}`)}${card("", `${illustratedTitle(market ? "La tua dispensa" : "La ricerca resta qui", "alimentazione")}<p class="text-sm text-base-content/85">${market ? "Le scelte rimangono salvate in questo browser. Nel gioco del piatto puoi usare gli ingredienti dei tre gruppi del modello." : "Puoi cercare nel catalogo e aprire il modulo del pasto. Non sono disponibili scansione, calorie o indice glicemico calcolati."}</p>${recent}`, link(market ? "frigo" : "diario", market ? "Apri il frigo" : "Apri il diario"))}</div>`;
}
export function foodGames() {
  return `${heading("Gioca e impara.", "Scopri gli ingredienti, un gesto alla volta.", back())}${card(
    "",
    `${illustratedTitle("Scegli la tua piccola sfida", "alimentazione")}${resourceMenu(
      [
        [
          "piatto",
          "chart-pie",
          "Crea il piatto perfetto",
          "Scegli quattro porzioni e verifica il modello",
        ],
        [
          "frigo-sano",
          "archive-box",
          "Frigo Sano",
          "Un gioco di 30 secondi sui gruppi alimentari",
        ],
        [
          "impara/alimentazione",
          "book-open",
          "Quiz sull’alimentazione",
          "Tre domande con una spiegazione per ogni risposta",
        ],
        [
          "frigo",
          "archive-box",
          "La tua dispensa",
          "Conserva gli ingredienti e usali nel piatto",
        ],
      ],
    )}<p class="text-xs text-base-content/85">Il gioco celebra le scoperte. Non calcola la glicemia o la qualità clinica di un pasto.</p>`,
  )}`;
}
export function fridgeGame({ ui, fridgeTimer }) {
  const game = ui.discovery.fridgeGame,
    t = fridgeTimer || { remaining: 30, running: false },
    group = fridgeRounds[game.index];
  const collected = game.selected || [];
  const shelves = ["vegetables", "carbs", "protein"]
    .map((category, row) => {
      const picks = collected
        .map((id, index) => ({
          food: foods.find((food) => food.id === id),
          index,
        }))
        .filter(({ food }) => food?.group === category);
      return `<div class="absolute left-[28%] flex w-[44%] items-end justify-center gap-1" style="top:${21 + row * 15}%">${picks.map(({ food, index }) => `<span data-fridge-game-pick="${index}">${foodPicture(food.id, "size-10 sm:size-14")}</span>`).join("")}</div>`;
    })
    .join("");
  const picture = `<figure class="relative mx-auto aspect-[1200/896] w-full max-w-xl" data-widget="fridge-game"><img src="assets/images/widget-fridge-stitch-v1.webp" alt="" width="1200" height="896" class="h-full w-full rounded-box object-contain" decoding="async">${shelves}</figure><p class="text-center text-sm text-base-content/85">${collected.length ? "Nel frigo: " + collected.map((id) => foods.find((food) => food.id === id)?.name).join(", ") + "." : "Gli ingredienti che riconosci trovano posto sui ripiani."}</p><ul class="steps steps-horizontal w-full text-xs" aria-label="Cinque scelte da completare">${Array.from({ length: 5 }, (_, index) => `<li class="step min-w-0 ${index < game.correct ? "step-primary" : ""}" data-content="${index + 1}">${index < game.correct ? `<span class="step-icon">${icon("check", "size-4")}</span>` : ""}<span class="sr-only">Scelta ${index + 1}: ${index < game.correct ? "completata" : "da completare"}</span></li>`).join("")}</ul>`;
  const body = game.finished
    ? `<h2 id="fridge-question" tabindex="-1">${game.correct === 5 ? "Hai ritrovato tutti i gruppi." : "Una scoperta da riprovare."}</h2><p>${game.correct}/5 scelte corrette. ${game.correct === 5 ? "Verdure, carboidrati e proteine si ritrovano nel gioco del piatto." : "Puoi ripartire senza fretta e conoscere gli ingredienti."}</p><button class="btn btn-primary min-h-11" data-action="fridge-game-start">Riprova la sfida</button>${link("piatto", "Crea il tuo piatto")}`
    : `<div class="flex flex-wrap items-center justify-between gap-3"><span id="fridge-game-time" class="badge badge-ghost badge-lg tabular-nums" aria-label="Tempo rimasto">${formatTime(t.remaining)}</span><span class="text-sm">${game.correct}/5 scelte · ${game.lives} ${game.lives === 1 ? "tentativo rimasto" : "tentativi rimasti"}</span></div><progress id="fridge-game-progress" class="progress progress-primary w-full" value="${t.remaining}" max="30" aria-label="Secondi rimasti nel gioco"></progress>${game.started ? `<h2 id="fridge-question" tabindex="-1">Trova un ingrediente: ${foodCategories[group]}.</h2><div class="grid grid-cols-3 gap-2">${foods.map((food) => `<button class="btn btn-outline h-auto min-h-28 flex-col gap-1 px-2 py-3 text-xs whitespace-normal sm:text-sm" data-action="fridge-game-answer" data-id="${food.id}">${foodPicture(food.id)}<span>${esc(food.name)}</span></button>`).join("")}</div><button class="btn btn-ghost min-h-11" data-action="fridge-game-stop">Interrompi il gioco</button>` : `<h2 id="fridge-question" tabindex="-1">Trovi i tre gruppi del piatto?</h2><p class="text-sm leading-relaxed">Pigna indica un gruppo: scegli un ingrediente che ne fa parte. Hai 30 secondi, cinque scelte e tre tentativi per gli errori.</p><button class="btn btn-primary min-h-11" data-action="fridge-game-start">${icon("play")}Inizia la sfida</button>`}`;
  return `${heading("Frigo Sano.", "Una piccola sfida educativa sui gruppi alimentari.", link("giochi", "Gioca e impara", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-2">${card("", `${body}${game.message ? `<div class="alert alert-info alert-soft" data-fridge-game-feedback role="status">${icon("information-circle")}<span>${esc(game.message)}</span></div>` : ""}<p class="text-xs text-base-content/85">Il risultato misura questo gioco. Gli alimenti non sono “buoni” o “cattivi”: porzioni, abbinamenti ed esigenze personali contano. La sfida non assegna foglie aggiuntive.</p>`)}${card("Il tuo frigo si riempie", picture)}</div>`;
}
export function dietaryGuide() {
  return `${heading("Mangia con equilibrio.", "Un riferimento educativo per comporre il pasto.", back())}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", `${illustratedTitle("Il metodo del piatto", "alimentazione")}<p class="max-w-[72ch] text-sm leading-relaxed">Il metodo CDC propone metà piatto di verdure non amidacee, un quarto di proteine e un quarto di alimenti con carboidrati. È un modello di spazio nel piatto, da adattare alle tue esigenze.</p><ul class="list"><li class="list-row px-0"><div><h3>Metà del piatto: verdure</h3><p class="mt-2 text-sm">Nel gioco puoi esplorare broccoli, spinaci e pomodori.</p></div></li><li class="list-row px-0"><div><h3>Un quarto: proteine</h3><p class="mt-2 text-sm">Fra gli esempi della dispensa ci sono tofu, pollo e salmone.</p></div></li><li class="list-row px-0"><div><h3>Un quarto: carboidrati</h3><p class="mt-2 text-sm">Quinoa, riso integrale e pane integrale sono fra le scelte del gioco.</p></div></li></ul><p class="text-xs text-base-content/85">Non sono prescrizioni di quantità o effetti sulla glicemia. Adatta il pasto alle indicazioni del tuo curante.</p>`, `<a class="btn btn-primary min-h-11" href="#piatto">Prova a comporre il piatto ${icon("arrow-right")}</a>`)}${card(
    "Dal modello al tuo giorno",
    resourceMenu([
      [
        "ricette",
        "book-open",
        "Ricette e benessere",
        "Tre idee di preparazione da esplorare",
      ],
      [
        "ricerca-alimento",
        "magnifying-glass",
        "Cerca un alimento",
        "Ritrova un ingrediente nel catalogo locale",
      ],
      [
        "informazioni",
        "information-circle",
        "Il metodo e le fonti",
        "Leggi i riferimenti educativi",
      ],
    ]),
    '<button class="btn btn-outline min-h-11" data-action="open-entry" data-type="meal">Aggiungi un pasto</button>',
  )}</div>`;
}
export function learningHub({ state, ui }) {
  const category = ui.learning.category,
    one = Object.hasOwn(quizSets, category),
    sets = one ? [[category, quizSets[category]]] : Object.entries(quizSets);
  return `${heading(one ? quizSets[category].title : "Le tue piccole scoperte.", one ? "Esplora gli argomenti, poi prova le tre domande." : "Scegli un tema del percorso e impara giocando.", link(one ? category : "percorso", one ? "Torna alla sezione" : "Il mio percorso", "arrow-left"))}<div class="grid items-start gap-6 ${one ? "" : "@4xl:grid-cols-2"}">${sets
    .map(([id, set]) => {
      const summary = quizSummary(state, id),
        collected = state.awards.some(
          (a) => a.id === "quiz:" + id && a.date === localDate(),
        );
      return card(
        set.title,
        `<ul class="list">${set.questions.map((q) => `<li class="list-row px-0"><span class="text-sm leading-relaxed">${esc(q.q)}</span></li>`).join("")}</ul><p class="text-xs text-base-content/85">${summary.best === null ? "Nessun punteggio in questo storico." : `Migliore nello storico: ${summary.best}/3 · ${summary.attempts} ${summary.attempts === 1 ? "tentativo" : "tentativi"}.`} ${collected ? "Le foglie di oggi sono già raccolte." : "+20 foglie una volta al giorno per questo quiz."}</p>`,
        `<a class="btn btn-primary min-h-11" href="#quiz/${id}">${summary.completed ? "Riprova" : "Inizia"} il quiz ${icon("arrow-right")}</a>`,
      );
    })
    .join("")}</div>`;
}
