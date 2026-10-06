import {
  foodExtras,
  foodCategories,
  plateFoods,
  catalogPlateBalance,
} from "../nutrition-catalog.js";
import {
  icon,
  esc,
  heading,
  titleRow,
  card,
  link,
  field,
} from "../ui/components.js";
import {
  plateBoard,
  ingredientPicker,
  fridgeMarket,
  fridgeShelves,
  plateGroups,
} from "../ui/nutrition-widgets.js";
import { pantryPlate } from "../insights.js";

const chickpeaNote = () =>
  `<p class="max-w-[72ch] text-xs leading-relaxed text-base-content/90">I ceci sono proteine vegetali e contengono anche carboidrati; questo modello rappresenta lo spazio nel piatto, non quantità di nutrienti. <a class="link underline-offset-4" href="https://diabetesfoodhub.org/blog/what-diabetes-plate" target="_blank" rel="noopener noreferrer">Il metodo del piatto dell’ADA (si apre in una nuova scheda)</a>.</p>`;

export function plate({ ui }) {
  const { items, message, meal, target = "all" } = ui.plate;
  const balance = catalogPlateBalance(items);
  const proportions = `<div class="flex flex-wrap justify-center gap-2" role="group" aria-label="Il modello del piatto"><span class="badge badge-soft h-auto bg-primary/10 py-2 text-base-content">½ verdure</span><span class="badge badge-soft h-auto bg-accent/15 py-2 text-base-content">¼ carboidrati</span><span class="badge badge-soft h-auto bg-secondary/10 py-2 text-base-content">¼ proteine</span></div><p class="text-sm text-base-content/90">Le porzioni rappresentano lo spazio nel piatto, non percentuali di nutrienti o grammature.</p>`;
  const chosen = items.length
    ? `<details class="collapse collapse-arrow border border-base-300"><summary class="collapse-title min-h-11 py-3 text-sm font-semibold">Le proporzioni che hai scelto</summary><div class="collapse-content grid gap-4">${plateGroups.map(({ id, label }) => `<div><div class="mb-2 flex justify-between gap-2 text-sm"><span>${label}</span><span>${balance.percent[id]}%</span></div><progress class="progress progress-primary w-full" value="${balance.percent[id]}" max="100" aria-label="Proporzione ${label}" aria-valuetext="${balance.percent[id]}% del piatto"></progress></div>`).join("")}</div></details>`
    : "";
  const result = message
    ? `<div class="alert alert-soft ${balance.balanced ? "alert-success" : "alert-warning text-warning-content"}" role="status" data-plate-feedback>${icon(balance.balanced ? "check" : "information-circle")}<span>${esc(message)}</span></div>${balance.balanced ? `${field("Quale pasto vuoi registrare?", `<select id="plate-meal" class="select min-h-11 border-secondary/75 w-full">${["Colazione", "Pranzo", "Cena", "Spuntino"].map((value) => `<option ${meal === value ? "selected" : ""}>${value}</option>`).join("")}</select>`)}<button class="btn btn-outline min-h-11 w-full" data-action="plate-save">Aggiungi al diario</button>` : ""}`
    : "";
  const board = `${titleRow("Il tuo piatto", '<button class="btn btn-ghost btn-sm min-h-11" data-action="plate-reset">Ricomincia</button>')}<p class="text-sm font-semibold" role="status" aria-live="polite">${items.length}/4 porzioni scelte</p>${plateBoard(items, target)}${proportions}${chosen}<button class="btn btn-primary min-h-11 w-full" data-action="plate-check" ${items.length === 4 ? "" : "disabled"}>${icon("check")}Verifica il piatto</button>${result}`;
  const ingredients = `<p class="text-sm text-base-content/90">Tocca un ingrediente: vedrai la sua porzione nel piatto. Puoi scegliere lo stesso alimento più volte.</p>${ingredientPicker(items, target)}${chickpeaNote()}`;
  return `${heading("Crea il tuo piatto.", "Scegli quattro porzioni: due di verdure, una di carboidrati e una di proteine.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.3fr]">${card("", board)}${card("Scegli gli ingredienti", ingredients, `${link("frigo", "Usa la tua dispensa")}${link("informazioni", "Il metodo e le fonti")}`)}</div>`;
}

export function fridge({ state }) {
  const pantry = [...state.fridge, ...(state.pantryExtras || [])];
  const suggestion = pantryPlate(pantry);
  const otherIngredients = (state.pantryExtras || []).filter(
    (id) => !plateFoods.some((food) => food.id === id),
  );
  const market = `<p class="text-sm text-base-content/90">Tocca un ingrediente per metterlo nel frigo. Puoi rimuoverlo dal mercato o dal suo ripiano.</p>${fridgeMarket(pantry)}`;
  const extraShelf = otherIngredients.length
    ? `<div><h3>Altri ingredienti del mercato</h3><ul class="list">${otherIngredients
        .map((id) => foodExtras.find((f) => f.id === id))
        .filter(Boolean)
        .map(
          (food) =>
            `<li class="list-row grid-cols-[minmax(0,1fr)_auto] items-center px-0"><div class="min-w-0"><strong>${esc(food.name)}</strong><p class="mt-1 text-xs text-base-content/90">${foodCategories[food.group]}</p></div><div class="flex"><button class="btn btn-ghost btn-circle size-11" data-action="food-add" data-id="${food.id}" aria-label="Racconta nel diario ${esc(food.name)}">${icon("plus")}</button><button class="btn btn-ghost btn-circle size-11" data-action="market-toggle" data-id="${food.id}" aria-label="Rimuovi dalla dispensa ${esc(food.name)}">${icon("x-mark")}</button></div></li>`,
        )
        .join(
          "",
        )}</ul><p class="text-xs text-base-content/90">Puoi raccontare anche questi ingredienti nel diario. Il gioco usa gli ingredienti dei ripiani Verdure, Proteine e Cereali e carboidrati.</p></div>`
    : "";
  const emptyFridge = pantry.length
    ? ""
    : '<figure class="mx-auto max-w-40"><img src="assets/images/widget-fridge-stitch-v1.webp" width="1200" height="896" class="w-full object-contain" alt="" decoding="async" loading="lazy"></figure>';
  const shelf = `<p class="text-sm text-base-content/90" role="status" aria-live="polite">${pantry.length} ${pantry.length === 1 ? "ingrediente conservato nella dispensa" : "ingredienti conservati nella dispensa"}.</p>${emptyFridge}${fridgeShelves(pantry)}${extraShelf}${chickpeaNote()}<p class="text-xs text-base-content/90">Le tue scelte vengono salvate in questo browser, per questo sito.</p>`;
  const next = `<div class="w-full"><p class="mb-3 text-sm text-base-content/90">${suggestion.missing.length ? `Per comporre il piatto, aggiungi: ${suggestion.missing.map((group) => ({ vegetables: "verdure", carbs: "carboidrati", protein: "proteine" })[group]).join(", ")}.` : "Hai ingredienti di tutti e tre i gruppi. Componiamo quattro porzioni con la tua dispensa?"}</p><button class="btn btn-primary h-auto min-h-11 w-full py-2 whitespace-normal" data-action="pantry-plate" ${suggestion.missing.length ? "disabled" : ""}>Usa la mia dispensa ${icon("arrow-right")}</button><a href="#piatto" class="btn btn-ghost mt-2 min-h-11 w-full">Scegli liberamente</a></div>`;
  return `${heading("Il frigo della salute.", "Una dispensa di idee per il tuo prossimo pasto.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1fr_1.5fr]">${card("Il mercato del bosco", market, link("mercato", "Esplora tutto il catalogo"), "bg-base-100 @4xl:order-2", 'id="fridge-market"')}${card("La tua dispensa", shelf, next, "bg-base-100 @4xl:order-1")}</div>`;
}
