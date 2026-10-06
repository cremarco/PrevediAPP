import { foods } from "../../data.js";
import { esc, icon } from "./components.js";
import { foodPicture } from "./food-art.js";

export const plateGroups = [
  { id: "vegetables", label: "Verdure", portions: 2 },
  { id: "carbs", label: "Carboidrati", portions: 1 },
  { id: "protein", label: "Proteine", portions: 1 },
];

// Keep original dense-array indices so duplicate portions remain removable.
export function plateSlots(items = []) {
  const slots = ["vegetables", "vegetables", "carbs", "protein"].map(
    (group, slot) => ({ group, slot, food: null, index: null, matches: true }),
  );
  const excess = [];
  items.forEach((id, index) => {
    const food = foods.find((item) => item.id === id);
    if (!food) return;
    const slot = slots.find((item) => item.group === food.group && !item.food);
    if (slot) Object.assign(slot, { food, index });
    else excess.push({ food, index });
  });
  for (const item of excess) {
    const slot = slots.find((cell) => !cell.food);
    if (!slot) break;
    Object.assign(slot, item, { matches: false });
  }
  return slots;
}

const groupLabel = (group) =>
  plateGroups.find((item) => item.id === group)?.label || "Ingredienti";

export function plateBoard(items = [], target = "all") {
  const slots = plateSlots(items);
  const padding = [
    "pt-6 pl-6 pr-1 pb-1 sm:pt-8 sm:pl-8",
    "pb-6 pl-6 pr-1 pt-1 sm:pb-8 sm:pl-8",
    "pt-6 pr-6 pl-1 pb-1 sm:pt-8 sm:pr-8",
    "pb-6 pr-6 pl-1 pt-1 sm:pb-8 sm:pr-8",
  ];
  const sectors = [0, 2, 1, 3]
    .map((slotNumber) => {
      const cell = slots[slotNumber];
      const vegetableNumber = cell.group === "vegetables" ? slotNumber + 1 : "";
      const label = `${groupLabel(cell.group)}${vegetableNumber ? ` ${vegetableNumber}` : ""}`;
      const selected = target === cell.group;
      const skin = !cell.matches
        ? "bg-warning/20 text-base-content"
        : cell.group === "vegetables"
          ? "bg-primary/10 text-base-content"
          : cell.group === "carbs"
            ? "bg-accent/15 text-base-content"
            : "bg-secondary/10 text-base-content";
      const action = cell.food
        ? `data-action="plate-remove" data-index="${cell.index}" data-item-index="${cell.index}" data-food="${cell.food.id}" aria-label="Rimuovi una porzione di ${esc(cell.food.name)} dal settore ${label}"`
        : `data-action="plate-target" data-group="${cell.group}" aria-label="Scegli gli ingredienti per ${label.toLocaleLowerCase("it-IT")}" aria-pressed="${selected}"`;
      const content = cell.food
        ? `${foodPicture(cell.food.id, "size-12 sm:size-16")}<span class="max-w-full text-xs leading-tight font-semibold">${esc(cell.food.name)}</span><span class="flex items-center gap-1 text-xs leading-tight">${icon("x-mark", "size-3")}Rimuovi</span>`
        : `${icon("plus", "size-6")}<span class="max-w-full text-xs leading-tight font-semibold">${label}</span><span class="text-xs leading-tight">Scegli</span>`;
      return `<button class="btn btn-ghost h-full min-h-11 min-w-0 flex-col flex-nowrap gap-1 rounded-none whitespace-normal ${padding[slotNumber]} ${skin} ${selected && !cell.food ? "btn-active" : ""} focus-visible:outline-offset-[-5px]" data-plate-slot="${slotNumber}" data-plate-group="${cell.group}" data-plate-match="${cell.matches}" ${action}>${content}</button>`;
    })
    .join("");
  return `<div class="flex flex-col items-center gap-4" data-widget="plate"><div class="mask mask-circle grid aspect-square w-full max-w-96 grid-cols-2 grid-rows-2 gap-1 bg-base-300 p-1" role="group" aria-label="Il tuo piatto: metà verdure, un quarto carboidrati e un quarto proteine">${sectors}</div><p class="text-center text-sm text-base-content/85">Tocca uno spazio vuoto per scegliere il gruppo. Tocca un ingrediente nel piatto per rimuoverlo.</p>${slots.some((cell) => !cell.matches) ? '<p class="text-center text-sm text-base-content/85">Uno spazio colorato indica una porzione di un altro gruppo. Puoi rimuoverla e riprovare.</p>' : ""}</div>`;
}

export function ingredientPicker(items = [], target = "all") {
  const group = plateGroups.some((item) => item.id === target) ? target : "all";
  const filters = [{ id: "all", label: "Tutti" }, ...plateGroups]
    .map(
      (item) =>
        `<button class="btn btn-sm join-item h-auto min-h-11 min-w-0 px-2 py-2 whitespace-normal ${group === item.id ? "btn-active" : "btn-outline"}" data-action="plate-target" data-group="${item.id}" aria-pressed="${group === item.id}">${item.label}</button>`,
    )
    .join("");
  const sections = plateGroups
    .filter((item) => group === "all" || item.id === group)
    .map((item) => {
      const count = items.filter(
        (id) => foods.find((food) => food.id === id)?.group === item.id,
      ).length;
      return `<fieldset class="fieldset gap-3 p-0"><legend class="fieldset-legend text-sm">${item.label} · ${count}/${item.portions} ${item.portions === 1 ? "porzione" : "porzioni"}</legend><div class="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">${foods
        .filter((food) => food.group === item.id)
        .map((food) => {
          const portions = items.filter((id) => id === food.id).length;
          return `<button class="btn btn-outline h-auto min-h-32 min-w-0 flex-col gap-2 px-2 py-3 text-xs whitespace-normal sm:text-sm ${portions ? "btn-active" : ""}" data-action="plate-add" data-id="${food.id}" data-food="${food.id}" aria-label="Aggiungi una porzione di ${esc(food.name)}${portions ? `, ${portions} ${portions === 1 ? "porzione già scelta" : "porzioni già scelte"}` : ""}" ${items.length >= 4 ? "disabled" : ""}>${foodPicture(food.id, "size-14 sm:size-16")}<span>${esc(food.name)}</span><span class="flex max-w-full items-center gap-1 text-xs">${icon("plus", "size-3")}<span class="min-w-0">${portions ? `${portions} nel piatto` : "Aggiungi"}</span></span></button>`;
        })
        .join("")}</div></fieldset>`;
    })
    .join("");
  return `<div class="join grid w-full grid-cols-2 sm:grid-cols-4" role="group" aria-label="Mostra ingredienti del gruppo">${filters}</div><div id="plate-foods-target" class="grid gap-5" tabindex="-1" aria-label="Ingredienti ${groupLabel(group).toLocaleLowerCase("it-IT")}">${sections}</div>`;
}

export function fridgeMarket(ids = []) {
  return plateGroups
    .map(
      (group) =>
        `<fieldset class="fieldset gap-3 p-0"><legend class="fieldset-legend text-sm">${group.label}</legend><div class="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">${foods
          .filter((food) => food.group === group.id)
          .map((food) => {
            const chosen = ids.includes(food.id);
            return `<button class="btn btn-outline h-auto min-h-32 min-w-0 flex-col gap-2 px-2 py-3 text-xs whitespace-normal sm:text-sm ${chosen ? "btn-active" : ""}" data-action="fridge-toggle" data-id="${food.id}" data-market-food="${food.id}" data-food="${food.id}" aria-label="${chosen ? "Rimuovi dalla" : "Aggiungi alla"} dispensa ${esc(food.name)}" aria-pressed="${chosen}">${foodPicture(food.id, "size-14 sm:size-16")}<span>${esc(food.name)}</span><span class="flex max-w-full items-center gap-1 text-xs">${icon(chosen ? "check" : "plus", "size-3")}<span class="min-w-0">${chosen ? "Nel frigo" : "Aggiungi"}</span></span></button>`;
          })
          .join("")}</div></fieldset>`,
    )
    .join("");
}

export function fridgeShelves(ids = []) {
  const shelves = ["vegetables", "protein", "carbs"]
    .map((group) => {
      const ingredients = foods.filter(
        (food) => food.group === group && ids.includes(food.id),
      );
      return `<li class="list-row grid-cols-1 gap-3 rounded-box bg-base-200/60 p-4" data-fridge-shelf="${group}"><div class="col-span-full grid min-w-0 gap-3"><div class="flex flex-wrap items-center justify-between gap-2"><h3 class="text-base">${group === "carbs" ? "Cereali e carboidrati" : groupLabel(group)}</h3><span class="badge badge-ghost" aria-label="${ingredients.length} ingredienti in questo ripiano">${ingredients.length}</span></div>${ingredients.length ? `<div class="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">${ingredients.map((food) => `<button class="btn btn-ghost h-auto min-h-28 min-w-0 flex-col gap-2 px-1 py-2 text-xs whitespace-normal" data-action="fridge-toggle" data-id="${food.id}" data-fridge-item="${food.id}" data-food="${food.id}" aria-label="Rimuovi dalla dispensa ${esc(food.name)}">${foodPicture(food.id, "size-12 sm:size-14")}<span>${esc(food.name)}</span><span class="flex items-center gap-1">${icon("x-mark", "size-3")}Rimuovi</span></button>`).join("")}</div>` : '<p class="text-sm text-base-content/85">Questo ripiano aspetta i tuoi ingredienti. Aggiungili dal mercato.</p>'}</div></li>`;
    })
    .join("");
  return `<ul class="list gap-4" data-widget="fridge">${shelves}</ul>`;
}
