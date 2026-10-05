import { foods, plateBalance } from "../../data.js";
import {
  icon,
  heading,
  titleRow,
  card,
  link,
  field,
} from "../ui/components.js";
import { pantryPlate } from "../insights.js";

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
  const ingredients = `${titleRow("La tua dispensa", `<button class="btn btn-ghost btn-sm min-h-11" data-action="plate-reset">Ricomincia</button>`)}<p class="text-sm text-base-content/85">Tocca un ingrediente per aggiungere una porzione. Puoi scegliere lo stesso alimento più volte.</p><div class="grid grid-cols-2 gap-3 sm:grid-cols-3">${foods.map((f) => `<button class="btn btn-outline h-auto min-h-24 flex-col gap-2 px-2 py-3 whitespace-normal ${plateItems.includes(f.id) ? "btn-primary btn-active" : ""}" data-action="plate-add" data-id="${f.id}" ${plateItems.length >= 4 ? "disabled" : ""}>${icon("plus")}<span>${f.name}</span>${plateItems.includes(f.id) ? `<span class="badge badge-sm badge-ghost">${plateItems.filter((id) => id === f.id).length} ${plateItems.filter((id) => id === f.id).length === 1 ? "porzione" : "porzioni"}</span>` : ""}</button>`).join("")}</div><div class="flex flex-wrap gap-2">${plateItems.map((id, i) => `<button class="btn btn-soft btn-sm min-h-11" data-action="plate-remove" data-index="${i}" aria-label="Rimuovi una porzione di ${foods.find((f) => f.id === id).name}">${foods.find((f) => f.id === id).name}${icon("x-mark", "size-4")}</button>`).join("")}</div><p class="text-sm text-base-content/85">${plateItems.length}/4 porzioni scelte</p><button class="btn btn-primary w-full" data-action="plate-check" ${plateItems.length === 4 ? "" : "disabled"}>${icon("check")}Verifica il piatto</button>${plateMessage ? `<div class="alert alert-soft ${balance.balanced ? "alert-success" : "alert-warning text-warning-content"}" role="status">${icon(balance.balanced ? "check" : "information-circle")}<span>${plateMessage}</span></div>${balance.balanced ? `${field("Quale pasto vuoi registrare?", `<select id="plate-meal" class="select border-secondary/75 w-full">${["Colazione", "Pranzo", "Cena", "Spuntino"].map((value) => `<option ${meal === value ? "selected" : ""}>${value}</option>`).join("")}</select>`)}<button class="btn btn-outline w-full" data-action="plate-save">Aggiungi al diario</button>` : ""}` : ""}`;
  return `${heading("Crea il tuo piatto.", "Scegli quattro porzioni: due di verdure, una di carboidrati e una di proteine.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-2">${card("Uno spazio per ogni alimento", model)}${card("", ingredients, link("informazioni", "Il metodo e le fonti"))}</div>`;
}

export function fridge({ state }) {
  const suggestion = pantryPlate(state.fridge);
  const market = `<p class="text-sm text-base-content/85">Seleziona gli ingredienti che vuoi ritrovare nella tua dispensa.</p><div class="grid gap-3 sm:grid-cols-2">${foods.map((f) => `<button class="btn btn-outline h-auto min-h-20 justify-start gap-3 p-4 text-left whitespace-normal ${state.fridge.includes(f.id) ? "btn-primary btn-active" : ""}" data-action="fridge-toggle" data-id="${f.id}" aria-pressed="${state.fridge.includes(f.id)}"><span class="min-w-0 flex-1"><strong class="block">${f.name}</strong><span class="mt-1 block text-xs font-normal">${{ vegetables: "Verdure", protein: "Proteine", carbs: "Carboidrati" }[f.group]}</span></span>${icon(state.fridge.includes(f.id) ? "check" : "plus")}</button>`).join("")}</div>`;
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
    )}<p class="text-xs text-base-content/85">Le tue scelte vengono salvate automaticamente su questo dispositivo.</p>`;
  return `${heading("Il frigo della salute.", "Una dispensa di idee per il tuo prossimo pasto.", link("alimentazione", "Alimentazione", "arrow-left"))}<div class="grid items-start gap-6 @4xl:grid-cols-[1.5fr_1fr]">${card("Il mercato del bosco", market)}${card("La tua dispensa", shelf, `<div class="w-full"><p class="mb-3 text-sm text-base-content/85">${suggestion.missing.length ? `Per comporre il piatto, aggiungi: ${suggestion.missing.map((group) => ({ vegetables: "verdure", carbs: "carboidrati", protein: "proteine" })[group]).join(", ")}.` : "Hai ingredienti di tutti e tre i gruppi. Componiamo quattro porzioni con la tua dispensa?"}</p><button class="btn btn-primary h-auto min-h-11 w-full py-2 whitespace-normal" data-action="pantry-plate" ${suggestion.missing.length ? "disabled" : ""}>Usa la mia dispensa ${icon("arrow-right")}</button><a href="#piatto" class="btn btn-ghost mt-2 min-h-11 w-full">Scegli liberamente</a></div>`)}</div>`;
}
