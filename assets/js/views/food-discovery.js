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
  recipeStepsFor,
  recipePantryFoods,
  searchRecipes,
  fridgeRounds,
} from "../nutrition-catalog.js";
import { formatTime } from "../timer.js";
import { quizSummary } from "../insights.js";
import { foodPicture } from "../ui/food-art.js";

const inputClass =
  "input min-h-11 w-full border-secondary/75 placeholder:text-base-content/90";
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
    .map((r) => {
      const favorite = state.recipeFavorites.includes(r.id);
      return card(
        r.name,
        `<p class="text-sm text-base-content/90">${r.minutes} min indicativi · ${r.tag}</p><p class="text-sm">${r.ingredients.slice(0, 3).map(esc).join(", ")}.</p>${favorite ? '<span class="badge badge-soft badge-primary self-start text-base-content">Nelle tue preferite</span>' : ""}`,
        `<a class="btn btn-primary min-h-11" href="#ricetta/${r.id}">Vedi ricetta<span class="sr-only">: ${esc(r.name)}</span> ${icon("arrow-right")}</a><button class="btn btn-ghost btn-circle size-11 ${favorite ? "btn-active text-primary" : ""}" data-action="recipe-favorite" data-id="${r.id}" aria-pressed="${favorite}" aria-label="${favorite ? "Rimuovi dalle" : "Aggiungi alle"} preferite ${esc(r.name)}">${icon("heart")}</button>`,
      );
    })
    .join("");
  return `${heading("Ricette e benessere.", "Tre idee del prototipo, da adattare ai tuoi gusti.", back())}${card("", filters)}<p class="mt-5 text-sm text-base-content/90" role="status" aria-atomic="true">${visible.length} ${visible.length === 1 ? "ricetta trovata" : "ricette trovate"}.</p><p class="my-5 max-w-[72ch] text-sm text-base-content/90">Le preparazioni sono esempi per esplorare gli ingredienti. Tempi indicativi, senza stime di calorie o indicazioni personalizzate.</p><div class="grid items-start gap-5 @4xl:grid-cols-3">${rows || card("", empty("Nessuna ricetta in questo filtro", "Cambia il tipo o cerca un altro nome.", '<button class="btn btn-outline min-h-11" data-action="recipe-clear-filter">Mostra tutte le ricette</button>'))}</div><div class="mt-6">${resourceMenu(
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
  const pantry = [...state.fridge, ...(state.pantryExtras || [])];
  const catalogIngredients = recipePantryFoods(r.id);
  const allPresent = catalogIngredients.every((food) =>
    pantry.includes(food.id),
  );
  const prepared = recipeStepsFor(r.id, ui.discovery.recipeSteps?.[r.id]);
  const pantryList = `<div><h3>Gli ingredienti del catalogo</h3><p class="mt-2 text-xs text-base-content/90">Puoi conservare questi ingredienti nella dispensa. Gli altri restano nella lista della preparazione.</p><ul class="list">${catalogIngredients.map((food) => `<li class="list-row grid-cols-[minmax(0,1fr)_auto] items-start px-0"><span class="min-w-0 text-sm">${esc(food.name)}</span><span class="badge badge-sm h-auto whitespace-normal ${pantry.includes(food.id) ? "badge-success" : "badge-ghost"}">${pantry.includes(food.id) ? "In dispensa" : "Da aggiungere"}</span></li>`).join("")}</ul></div>`;
  const preparation = `<fieldset class="fieldset gap-4"><legend class="fieldset-legend">Segna i passi che hai preparato</legend><p class="text-sm text-base-content/90" role="status">${prepared.length}/${r.steps.length} passi completati${prepared.length === r.steps.length ? ". Ora puoi raccontare il pasto nel diario." : ". Puoi seguirli e spuntarli al tuo ritmo."}</p><progress class="progress progress-primary w-full" value="${prepared.length}" max="${r.steps.length}" aria-label="Passi della preparazione completati" aria-valuetext="${prepared.length} di ${r.steps.length} passi completati"></progress><ol class="list">${r.steps.map((text, index) => `<li class="list-row grid-cols-1 px-0"><label class="label min-h-11 items-start gap-3 whitespace-normal text-base-content"><input type="checkbox" class="checkbox mt-1 shrink-0" data-action="recipe-step" data-id="${r.id}" data-index="${index}" ${prepared.includes(index) ? "checked" : ""}><span class="min-w-0 text-sm leading-relaxed"><strong class="mr-1">${index + 1}.</strong>${esc(text)}</span></label></li>`).join("")}</ol><p class="text-xs text-base-content/90">Le spunte restano durante la navigazione in questa scheda; ricaricare la pagina le cancella. Non registrano un pasto automaticamente.</p></fieldset>`;
  return `${heading(r.name, "Una preparazione da personalizzare.", link("ricette", "Ricette", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card("", `${illustratedTitle("Gli ingredienti", "alimentazione")}<p class="text-sm text-base-content/90">${r.minutes} minuti indicativi · ${r.tag}</p><ul class="list">${r.ingredients.map((text) => `<li class="list-row px-0"><span>${esc(text)}</span></li>`).join("")}</ul><p class="text-xs text-base-content/90">Scegli quantità e ingredienti secondo le tue esigenze, allergie e indicazioni del curante.</p>${pantryList}`, `<button class="btn btn-outline h-auto min-h-11 w-full max-w-full py-2 whitespace-normal" data-action="recipe-pantry" data-id="${r.id}" ${allPresent ? "disabled" : ""}>${icon(allPresent ? "check" : "archive-box")}<span class="min-w-0">${allPresent ? "Ingredienti del catalogo già in dispensa" : "Aggiungi gli ingredienti del catalogo"}</span></button>${link("frigo", "Apri il frigo")}`)}${card("Prepariamola insieme", preparation, `<button class="btn btn-primary h-auto min-h-11 py-2 whitespace-normal" data-action="recipe-save" data-id="${r.id}">${icon("plus")}Racconta questo pasto</button><button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal ${state.recipeFavorites.includes(r.id) ? "btn-active" : ""}" data-action="recipe-favorite" data-id="${r.id}" aria-pressed="${state.recipeFavorites.includes(r.id)}">${icon("heart")}${state.recipeFavorites.includes(r.id) ? "Nelle tue preferite" : "Salva tra le preferite"}</button>`)}</div>`;
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
  )}<p class="text-xs text-base-content/90" role="status" aria-atomic="true">Catalogo locale: ${items.length} ${items.length === 1 ? "ingrediente" : "ingredienti"} nel filtro. Le categorie aiutano a esplorare il cibo; non sono un giudizio sulla tua salute.</p>`;
  const shelf = [...state.fridge, ...state.pantryExtras];
  const rows = items.length
    ? `<ul class="list">${items.map((food) => `<li class="list-row grid-cols-[minmax(0,1fr)_auto] items-start px-0"><div class="min-w-0"><strong>${esc(food.name)}</strong><p class="mt-1 text-xs text-base-content/90">${foodCategories[food.group]}</p></div><button class="btn btn-outline btn-circle size-11" data-action="${market ? "market-toggle" : "food-add"}" data-id="${food.id}" aria-label="${market ? (shelf.includes(food.id) ? "Rimuovi dalla" : "Aggiungi alla") + " dispensa" : "Racconta nel diario"} ${esc(food.name)}" ${market ? `aria-pressed="${shelf.includes(food.id)}"` : ""}>${icon(market && shelf.includes(food.id) ? "check" : "plus")}</button></li>`).join("")}</ul>`
    : empty(
        "Nessun ingrediente trovato",
        "Prova un nome più breve o togli il filtro.",
        '<button class="btn btn-outline min-h-11" data-action="food-clear-filter">Mostra tutto il catalogo</button>',
      );
  const recent = `${state.foodSearches.length ? `<div class="flex flex-wrap items-center justify-between gap-3"><h2>Ricerche recenti</h2><button class="btn btn-ghost min-h-11" data-action="food-clear-recent">Cancella ricerche</button></div><div class="mt-3 flex flex-wrap gap-2">${state.foodSearches.map((text) => `<button class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal" data-action="food-recent" data-text="${esc(text)}">${esc(text)}</button>`).join("")}</div>` : ""}`;
  return `${heading(market ? "Il mercato del bosco." : "Cerca un alimento.", market ? "Esplora e conserva gli ingredienti nella tua dispensa." : "Trova un ingrediente da raccontare nel diario.", back())}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", `${filters}${rows}`)}${card("", `${illustratedTitle(market ? "La tua dispensa" : "La ricerca resta qui", "alimentazione")}<p class="text-sm text-base-content/90">${market ? "Le scelte rimangono salvate in questo browser. Nel gioco del piatto puoi usare gli ingredienti dei tre gruppi del modello." : "Puoi cercare nel catalogo e aprire il modulo del pasto. Non sono disponibili scansione, calorie o indice glicemico calcolati."}</p>${recent}`, link(market ? "frigo" : "diario", market ? "Apri il frigo" : "Apri il diario"))}</div>`;
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
    )}<p class="text-xs text-base-content/90">Il gioco celebra le scoperte. Non calcola la glicemia o la qualità clinica di un pasto.</p>`,
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
  const picture = `<figure class="relative mx-auto aspect-[1200/896] w-full max-w-xl" data-widget="fridge-game" aria-hidden="true"><img src="assets/images/widget-fridge-stitch-v1.webp" alt="" width="1200" height="896" class="h-full w-full rounded-box object-contain" decoding="async">${shelves}</figure><p class="text-center text-sm text-base-content/90">${collected.length ? "Nel frigo: " + collected.map((id) => foods.find((food) => food.id === id)?.name).join(", ") + "." : "Gli ingredienti che riconosci trovano posto sui ripiani."}</p><ul class="steps steps-horizontal w-full text-xs" role="list" aria-label="Cinque scelte da completare">${Array.from({ length: 5 }, (_, index) => `<li class="step min-w-0 ${index < game.correct ? "step-primary" : ""}" data-content="${index + 1}">${index < game.correct ? `<span class="step-icon">${icon("check", "size-4")}</span>` : ""}<span class="sr-only">Scelta ${index + 1}: ${index < game.correct ? "completata" : "da completare"}</span></li>`).join("")}</ul>`;
  const startActions = `<div class="card-actions"><button type="button" class="btn btn-primary h-auto min-h-11 py-2 whitespace-normal" data-action="fridge-game-start" data-mode="timed">${icon("play")}${game.finished ? "Riprova" : "Inizia"} la sfida di 30 secondi</button><button type="button" class="btn btn-outline h-auto min-h-11 py-2 whitespace-normal" data-action="fridge-game-start" data-mode="untimed">Gioca senza limite di tempo</button></div>`;
  const timing = game.untimed
    ? '<span class="badge badge-ghost badge-lg h-auto whitespace-normal py-2">Senza limite di tempo</span>'
    : `<span id="fridge-game-time" class="badge badge-ghost badge-lg tabular-nums" role="timer" aria-live="off" aria-label="Tempo rimasto">${formatTime(t.remaining)}</span>`;
  const timeProgress = game.untimed
    ? ""
    : `<progress id="fridge-game-progress" class="progress progress-primary w-full" value="${t.remaining}" max="30" aria-label="Tempo rimasto nel gioco" aria-valuetext="${t.remaining} secondi rimasti" aria-live="off"></progress>`;
  const body = game.finished
    ? `<h2 id="fridge-question" tabindex="-1">${game.correct === 5 ? "Hai ritrovato tutti i gruppi." : "Una scoperta da riprovare."}</h2><p>${game.correct}/5 scelte corrette. ${game.correct === 5 ? "Verdure, carboidrati e proteine si ritrovano nel gioco del piatto." : "Puoi ripartire senza fretta e conoscere gli ingredienti."}</p>${startActions}${link("piatto", "Crea il tuo piatto")}`
    : `<div class="flex flex-wrap items-center justify-between gap-3">${timing}<span class="text-sm">${game.correct}/5 scelte · ${game.lives} ${game.lives === 1 ? "tentativo rimasto" : "tentativi rimasti"}</span></div>${timeProgress}${game.started ? `<h2 id="fridge-question" tabindex="-1">Trova un ingrediente: ${foodCategories[group]}.</h2><div class="grid grid-cols-3 gap-2" role="group" aria-labelledby="fridge-question">${foods.map((food) => `<button type="button" class="btn btn-outline h-auto min-h-28 flex-col gap-1 px-2 py-3 text-xs whitespace-normal sm:text-sm" data-action="fridge-game-answer" data-id="${food.id}">${foodPicture(food.id)}<span>${esc(food.name)}</span></button>`).join("")}</div><button type="button" class="btn btn-ghost min-h-11" data-action="fridge-game-stop">Interrompi il gioco</button>` : `<h2 id="fridge-question" tabindex="-1">Trovi i tre gruppi del piatto?</h2><p class="text-sm leading-relaxed">Pigna indica un gruppo: scegli un ingrediente che ne fa parte. Completa cinque scelte, con tre tentativi per gli errori. Scegli la sfida di 30 secondi oppure gioca senza limite di tempo.</p>${startActions}`}`;
  return `${heading("Frigo Sano.", "Una piccola sfida educativa sui gruppi alimentari.", link("giochi", "Gioca e impara", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-2">${card("", `${body}${game.message ? `<div class="alert alert-info alert-soft" data-fridge-game-feedback role="status">${icon("information-circle")}<span>${esc(game.message)}</span></div>` : ""}<p class="text-xs text-base-content/90">Il risultato misura questo gioco. Gli alimenti non sono “buoni” o “cattivi”: porzioni, abbinamenti ed esigenze personali contano. La sfida non assegna foglie aggiuntive.</p>`)}${card("Il tuo frigo si riempie", picture)}</div>`;
}
export function dietaryGuide() {
  return `${heading("Mangia con equilibrio.", "Un riferimento educativo per comporre il pasto.", back())}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("", `${illustratedTitle("Il metodo del piatto", "alimentazione")}<p class="max-w-[72ch] text-sm leading-relaxed">Il metodo CDC propone metà piatto di verdure non amidacee, un quarto di proteine e un quarto di alimenti con carboidrati. È un modello di spazio nel piatto, da adattare alle tue esigenze.</p><ul class="list"><li class="list-row px-0"><div><h3>Metà del piatto: verdure</h3><p class="mt-2 text-sm">Nel gioco puoi esplorare broccoli, spinaci e pomodori.</p></div></li><li class="list-row px-0"><div><h3>Un quarto: proteine</h3><p class="mt-2 text-sm">Fra gli esempi della dispensa ci sono tofu, pollo e salmone.</p></div></li><li class="list-row px-0"><div><h3>Un quarto: carboidrati</h3><p class="mt-2 text-sm">Quinoa, riso integrale e pane integrale sono fra le scelte del gioco.</p></div></li></ul><p class="text-xs text-base-content/90">Non sono prescrizioni di quantità o effetti sulla glicemia. Adatta il pasto alle indicazioni del tuo curante.</p>`, `<a class="btn btn-primary min-h-11" href="#piatto">Prova a comporre il piatto ${icon("arrow-right")}</a>`)}${card(
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
        `<ul class="list">${set.questions.map((q) => `<li class="list-row px-0"><span class="text-sm leading-relaxed">${esc(q.q)}</span></li>`).join("")}</ul><p class="text-xs text-base-content/90">${summary.best === null ? "Nessun punteggio in questo storico." : `Migliore nello storico: ${summary.best}/3 · ${summary.attempts} ${summary.attempts === 1 ? "tentativo" : "tentativi"}.`} ${collected ? "Le foglie di oggi sono già raccolte." : "+20 foglie una volta al giorno per questo quiz."}</p>`,
        `<a class="btn btn-primary min-h-11" href="#quiz/${id}">${summary.completed ? "Riprova" : "Inizia"} il quiz<span class="sr-only">: ${esc(set.title)}</span> ${icon("arrow-right")}</a>`,
      );
    })
    .join("")}</div>`;
}
