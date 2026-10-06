import { foodExtras, foodCategories } from "../nutrition-catalog.js";
import { foods, plateBalance } from "../../data.js";
import {
  icon,
  esc,
  heading,
  titleRow,
  card,
  link,
  field,
  illustratedTitle,
} from "../ui/components.js";
import { pantryPlate } from "../insights.js";

const foodGroups = [
  ["vegetables", "Verdure", 2],
  ["carbs", "Carboidrati", 1],
  ["protein", "Proteine", 1],
];

export function plate({ ui }) {
  const { items: plateItems, message: plateMessage, meal } = ui.plate;
  const balance = plateBalance(plateItems),
    names = (group) =>
      plateItems
        .filter((id) => foods.find((f) => f.id === id)?.group === group)
        .map((id) => foods.find((f) => f.id === id).name);
  const model = `<div class="stats stats-vertical w-full bg-primary/5 sm:stats-horizontal">${[
    ["vegetables", "Verdure", "50%"],
    ["carbs", "Carboidrati", "25%"],
    ["protein", "Proteine", "25%"],
  ]
    .map(
      ([group, label, target]) =>
        `<div class="stat min-w-0 p-4"><div class="stat-title text-base-content/85">${label}</div><div class="stat-value font-serif text-3xl font-medium">${target}</div><div class="stat-desc mt-2 flex flex-wrap gap-1 whitespace-normal text-base-content/85">${
          names(group)
            .map((n) => `<span class="badge badge-ghost badge-sm">${n}</span>`)
            .join("") || "Scegli dalla dispensa"
        }</div></div>`,
    )
    .join(
      "",
    )}</div><p class="text-sm text-base-content/85">Le porzioni rappresentano lo spazio nel piatto, non percentuali di nutrienti o grammature.</p><h3>Le proporzioni che hai scelto</h3>${Object.entries(
    { vegetables: "Verdure", carbs: "Carboidrati", protein: "Proteine" },
  )
    .map(
      ([id, label]) =>
        `<div><div class="mb-2 flex justify-between text-sm"><span>${label}</span><span>${balance.percent[id]}%</span></div><progress class="progress progress-primary w-full" value="${balance.percent[id]}" max="100" aria-label="Proporzione ${label}"></progress></div>`,
    )
    .join("")}`;
  const ingredients = `${titleRow("La tua dispensa", `<button class="btn btn-ghost btn-sm min-h-11" data-action="plate-reset">Ricomincia</button>`)}<p class="text-sm text-base-content/85">Tocca un ingrediente per aggiungere una porzione. Puoi sceglierlo più volte.</p><p class="text-sm font-semibold" role="status" aria-live="polite">${plateItems.length}/4 porzioni scelte</p>${foodGroups
    .map(
      ([group, label, target]) =>
        `<fieldset class="fieldset gap-3 p-0"><legend class="fieldset-legend text-sm">${label} · ${names(group).length}/${target} ${target === 1 ? "porzione" : "porzioni"}</legend><div class="grid grid-cols-3 gap-2">${foods
          .filter((food) => food.group === group)
          .map((food) => {
            const portions = plateItems.filter((id) => id === food.id).length;
            return `<button class="btn btn-outline h-auto min-h-20 flex-col gap-2 px-2 py-3 text-xs whitespace-normal sm:text-sm ${portions ? "btn-primary btn-active" : ""}" data-action="plate-add" data-id="${food.id}" aria-label="Aggiungi una porzione di ${food.name}${portions ? `, ${portions} ${portions === 1 ? "porzione già scelta" : "porzioni già scelte"}` : ""}" ${plateItems.length >= 4 ? "disabled" : ""}>${icon("plus")}<span>${food.name}</span>${portions ? `<span class="badge badge-sm badge-ghost">${portions}</span>` : ""}</button>`;
          })
          .join("")}</div></fieldset>`,
    )
    .join(
      "",
    )}<div class="flex flex-wrap gap-2">${plateItems.map((id, i) => `<button class="btn btn-soft btn-sm min-h-11" data-action="plate-remove" data-index="${i}" aria-label="Rimuovi una porzione di ${foods.find((f) => f.id === id).name}">${foods.find((f) => f.id === id).name}${icon("x-mark", "size-4")}</button>`).join("")}</div><button class="btn btn-primary min-h-11 w-full" data-action="plate-check" ${plateItems.length === 4 ? "" : "disabled"}>${icon("check")}Verifica il piatto</button>${plateMessage ? `<div class="alert alert-soft ${balance.balanced ? "alert-success" : "alert-warning text-warning-content"}" role="status">${icon(balance.balanced ? "check" : "information-circle")}<span>${plateMessage}</span></div>${balance.balanced ? `${field("Quale pasto vuoi registrare?", `<select id="plate-meal" class="select min-h-11 border-secondary/75 w-full">${["Colazione", "Pranzo", "Cena", "Spuntino"].map((value) => `<option ${meal === value ? "selected" : ""}>${value}</option>`).join("")}</select>`)}<button class="btn btn-outline min-h-11 w-full" data-action="plate-save">Aggiungi al diario</button>` : ""}` : ""}`;
  return `${heading("Crea il tuo piatto.", "Scegli quattro porzioni: due di verdure, una di carboidrati e una di proteine.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.3fr_1fr]">${card("", ingredients)}${card("", `${illustratedTitle("Il modello del piatto", "alimentazione")}${model}`, link("informazioni", "Il metodo e le fonti"))}</div>`;
}

export function fridge({ state }) {
  const suggestion = pantryPlate(state.fridge);
  const market = `<p class="text-sm text-base-content/85">Seleziona gli ingredienti che vuoi ritrovare nella tua dispensa.</p>${foodGroups
    .map(
      ([group, label]) =>
        `<fieldset class="fieldset gap-3 p-0"><legend class="fieldset-legend text-sm">${label}</legend><div class="grid grid-cols-3 gap-2">${foods
          .filter((food) => food.group === group)
          .map(
            (food) =>
              `<button class="btn btn-outline h-auto min-h-20 flex-col gap-2 px-2 py-3 text-xs whitespace-normal sm:text-sm ${state.fridge.includes(food.id) ? "btn-primary btn-active" : ""}" data-action="fridge-toggle" data-id="${food.id}" aria-pressed="${state.fridge.includes(food.id)}">${icon(state.fridge.includes(food.id) ? "check" : "plus")}<span>${food.name}</span></button>`,
          )
          .join("")}</div></fieldset>`,
    )
    .join("")}`;
  const extraShelf = state.pantryExtras?.length
    ? `<div><h3>Altri ingredienti del mercato</h3><ul class="list">${state.pantryExtras
        .map((id) => foodExtras.find((f) => f.id === id))
        .filter(Boolean)
        .map(
          (food) =>
            `<li class="list-row grid-cols-[minmax(0,1fr)_auto] items-center px-0"><div class="min-w-0"><strong>${esc(food.name)}</strong><p class="mt-1 text-xs text-base-content/85">${foodCategories[food.group]}</p></div><div class="flex"><button class="btn btn-ghost btn-circle size-11" data-action="food-add" data-id="${food.id}" aria-label="Racconta nel diario ${esc(food.name)}">${icon("plus")}</button><button class="btn btn-ghost btn-circle size-11" data-action="market-toggle" data-id="${food.id}" aria-label="Rimuovi dalla dispensa ${esc(food.name)}">${icon("x-mark")}</button></div></li>`,
        )
        .join(
          "",
        )}</ul><p class="text-xs text-base-content/85">Puoi raccontare questi ingredienti nel diario con il pulsante Aggiungi. Il gioco del piatto propone i nove ingredienti del mercato qui sopra.</p></div>`
    : "";
  const shelf = `${["vegetables", "protein", "carbs"]
    .map(
      (group) =>
        `<div><h3 class="text-base">${{ vegetables: "Verdure", protein: "Proteine", carbs: "Cereali e carboidrati" }[group]}</h3><div class="mt-3 flex flex-wrap gap-2">${
          state.fridge
            .filter((id) => foods.find((f) => f.id === id)?.group === group)
            .map(
              (id) =>
                `<span class="badge badge-soft badge-primary text-base-content">${foods.find((f) => f.id === id).name}</span>`,
            )
            .join("") ||
          '<span class="text-sm text-base-content/85">Scegli un ingrediente dal mercato.</span>'
        }</div></div>`,
    )
    .join(
      "",
    )}${extraShelf}<p class="text-xs text-base-content/85">Le tue scelte vengono salvate in questo browser, per questo sito.</p>`;
  return `${heading("Il frigo della salute.", "Una dispensa di idee per il tuo prossimo pasto.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("Il mercato del bosco", market)}${card("", `${illustratedTitle("La tua dispensa", "alimentazione")}${shelf}`, `<div class="w-full"><p class="mb-3 text-sm text-base-content/85">${suggestion.missing.length ? `Per comporre il piatto, aggiungi: ${suggestion.missing.map((group) => ({ vegetables: "verdure", carbs: "carboidrati", protein: "proteine" })[group]).join(", ")}.` : "Hai ingredienti di tutti e tre i gruppi. Componiamo quattro porzioni con la tua dispensa?"}</p><button class="btn btn-primary h-auto min-h-11 w-full py-2 whitespace-normal" data-action="pantry-plate" ${suggestion.missing.length ? "disabled" : ""}>Usa la mia dispensa ${icon("arrow-right")}</button><a href="#piatto" class="btn btn-ghost mt-2 min-h-11 w-full">Scegli liberamente</a></div>`)}</div>`;
}
