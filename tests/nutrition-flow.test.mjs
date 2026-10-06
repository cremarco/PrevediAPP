import test from "node:test";
import assert from "node:assert/strict";
import {
  foods,
  initialState,
  parseState,
  plateBalance,
  addEntry,
  totalPoints,
  localDate,
} from "../assets/data.js";
import {
  catalogPlateBalance,
  foodById,
  findFoods,
  plateFoods,
  recipes,
  recipePantryFoods,
  recipeStepsFor,
  toggleRecipeStep,
} from "../assets/js/nutrition-catalog.js";
import { pantryPlate, habitLabels } from "../assets/js/insights.js";
import {
  plateSlots,
  ingredientPicker,
  fridgeShelves,
} from "../assets/js/ui/nutrition-widgets.js";
import { foodPicture, hasFoodPicture } from "../assets/js/ui/food-art.js";
import { plate, fridge } from "../assets/js/views/nutrition.js";
import { recipeDetail, recipeList } from "../assets/js/views/food-discovery.js";
import { dashboard, progress } from "../assets/js/views/journey.js";
import { rewardCollections } from "../assets/js/views/forest-discovery.js";
import { initialSession } from "../assets/js/session.js";
import { updateEntry, shiftDate } from "../assets/js/records.js";

test("Compatible extra pantry ingredients survive v1 storage and form a balanced diary meal", () => {
  const state = initialState();
  state.fridge = ["tofu"];
  state.pantryExtras = ["carote", "farro", "uova", "ceci"];
  const restored = parseState(JSON.stringify(state));
  assert.deepEqual(restored.fridge, ["tofu"]);
  assert.deepEqual(restored.pantryExtras, state.pantryExtras);
  const suggestion = pantryPlate([
    ...restored.fridge,
    ...restored.pantryExtras,
  ]);
  assert.deepEqual(suggestion.missing, []);
  assert.deepEqual(suggestion.items, ["carote", "carote", "farro", "tofu"]);
  assert.equal(catalogPlateBalance(suggestion.items).balanced, true);
  const extraOnly = pantryPlate(["carote", "farro", "uova"]);
  assert.deepEqual(extraOnly.items, ["carote", "carote", "farro", "uova"]);
  const label = extraOnly.items.map((id) => foodById(id).name).join(", ");
  addEntry(restored, { type: "meal", meal: "Pranzo", label });
  assert.equal(restored.entries[0].label, "Carote, Carote, Farro, Uova");
  assert.equal(totalPoints(restored), 20);
  assert.equal(parseState(JSON.stringify(restored)).entries[0].label, label);
});

test("Expanded plate preserves legacy balances and rejects unsupported or fifth portions", () => {
  assert.equal(foods.length, 9);
  for (const items of [
    [],
    ["broccoli"],
    ["tofu", "broccoli", "quinoa", "broccoli"],
    ["salmone", "pollo", "pane", "spinaci"],
  ])
    assert.deepEqual(catalogPlateBalance(items), plateBalance(items));
  assert.equal(plateFoods.length, 15);
  assert.equal(
    catalogPlateBalance(["carote", "zucchine", "avena", "uova"]).balanced,
    true,
  );
  assert.equal(
    catalogPlateBalance(["carote", "carote", "farro", "mela-rossa"]).balanced,
    false,
  );
  assert.equal(
    catalogPlateBalance(["carote", "carote", "farro", "uova", "unknown"])
      .balanced,
    false,
  );
  assert.deepEqual(pantryPlate(["mela-rossa", "unknown"]).missing, [
    "vegetables",
    "carbs",
    "protein",
  ]);
});

test("Quinoa recipe ingredients make a usable plate while chickpeas retain their legumes category", () => {
  const state = initialState();
  for (const ingredient of recipePantryFoods("quinoa"))
    (foods.some((food) => food.id === ingredient.id)
      ? state.fridge
      : state.pantryExtras
    ).push(ingredient.id);
  const restored = parseState(JSON.stringify(state));
  assert.deepEqual(restored.fridge, ["quinoa", "pomodori"]);
  assert.deepEqual(restored.pantryExtras, ["ceci"]);
  assert.equal(foodById("ceci").group, "legumes");
  assert.equal(Object.hasOwn(foodById("ceci"), "plateGroup"), false);
  assert.equal(plateFoods.find((food) => food.id === "ceci").group, "legumes");
  assert.equal(
    plateFoods.find((food) => food.id === "ceci").plateGroup,
    "protein",
  );
  assert.deepEqual(
    findFoods("ceci", "legumes").map((food) => food.id),
    ["ceci"],
  );
  assert.deepEqual(findFoods("ceci", "protein"), []);
  const suggestion = pantryPlate([
    ...restored.fridge,
    ...restored.pantryExtras,
  ]);
  assert.deepEqual(suggestion.missing, []);
  assert.deepEqual(suggestion.items, [
    "pomodori",
    "pomodori",
    "quinoa",
    "ceci",
  ]);
  assert.equal(catalogPlateBalance(suggestion.items).balanced, true);
  const slots = plateSlots(suggestion.items);
  assert.equal(slots[3].food.id, "ceci");
  assert.equal(slots[3].matches, true);
  assert.match(ingredientPicker([], "protein"), /data-id="ceci"/);
  const pantry = fridge({ state: restored });
  assert.doesNotMatch(pantry, /data-action="pantry-plate" disabled/);
  assert.match(pantry, /data-action="market-toggle" data-id="ceci"/);
  assert.match(
    pantry,
    /I ceci sono proteine vegetali e contengono anche carboidrati/,
  );
  assert.match(
    pantry,
    /https:\/\/diabetesfoodhub.org\/blog\/what-diabetes-plate/,
  );
  assert.doesNotMatch(pantry, />1<span class="sr-only"> ingredienti/);
  assert.match(
    fridgeShelves(["ceci"]),
    />1<span class="sr-only"> ingrediente in questo ripiano<\/span>/,
  );
  const allIngredients = ingredientPicker([], "all");
  assert.match(allIngredients, /aria-label="Tutti gli ingredienti"/);
  assert.doesNotMatch(allIngredients, /Ingredienti ingredienti/);
  const checkedPlate = plate({
    ui: {
      plate: { items: suggestion.items, meal: "Pranzo", message: "Verificato" },
    },
  });
  assert.match(checkedPlate, /data-action="plate-save"/);
  assert.match(
    checkedPlate,
    /I ceci sono proteine vegetali e contengono anche carboidrati/,
  );
});

test("Repeated extra portions retain removable indices and honest artwork", () => {
  const slots = plateSlots(["uova", "carote", "farro", "carote"]);
  assert.deepEqual(
    slots.map((slot) => slot.index),
    [1, 3, 2, 0],
  );
  assert.equal(
    slots.every((slot) => slot.matches),
    true,
  );
  assert.equal(plateFoods.length, 15);
  for (const food of plateFoods) {
    assert.equal(hasFoodPicture(food.id), true, `${food.name} has artwork`);
    const picture = foodPicture(food.id);
    assert.match(picture, /aria-hidden="true"/);
    assert.match(
      picture,
      foods.some((item) => item.id === food.id)
        ? /widget-ingredients-atlas-v1\.webp/
        : new RegExp(`food-${food.id}-v1\\.webp`),
    );
  }
  assert.equal(hasFoodPicture("unknown"), false);
  assert.equal(foodPicture("unknown"), "");
  const picker = ingredientPicker(["carote", "carote"], "vegetables");
  assert.match(
    picker,
    /data-id="carote"[^>]*aria-label="Aggiungi una porzione di Carote, 2 porzioni già scelte"/,
  );
  assert.match(picker, /data-id="zucchine"/);
  const shelf = fridgeShelves(["carote", "farro", "uova"]);
  assert.equal((shelf.match(/data-action="market-toggle"/g) || []).length, 3);
  assert.doesNotMatch(shelf, /data-action="fridge-toggle"/);
  const pantry = initialState();
  pantry.pantryExtras = ["carote", "farro", "uova"];
  const pantryView = fridge({ state: pantry });
  assert.doesNotMatch(pantryView, /data-action="pantry-plate" disabled/);
  assert.match(pantryView, /3 ingredienti conservati/);
  const checked = plate({
    ui: {
      plate: {
        items: ["carote", "carote", "farro", "uova"],
        meal: "Cena",
        message: "Verificato",
      },
    },
  });
  assert.match(checked, /data-action="plate-save"/);
});

test("Recipe checklist supports skipped steps and independent recipes without storing diary entries", () => {
  const steps = {};
  assert.equal(toggleRecipeStep(steps, "quinoa", 2), true);
  assert.deepEqual(steps.quinoa, [2]);
  assert.equal(toggleRecipeStep(steps, "hummus", 0), true);
  assert.equal(toggleRecipeStep(steps, "quinoa", 2), true);
  assert.deepEqual(steps.quinoa, []);
  assert.deepEqual(steps.hummus, [0]);
  const before = JSON.stringify(steps);
  assert.equal(toggleRecipeStep(steps, "unknown", 0), false);
  assert.equal(toggleRecipeStep(steps, "quinoa", 3), false);
  assert.equal(toggleRecipeStep(steps, "quinoa", "1"), false);
  assert.equal(JSON.stringify(steps), before);
  assert.deepEqual(recipeStepsFor("quinoa", [0, 0, 2, -1, 3, "1"]), [0, 2]);
  const state = initialState(),
    ui = initialSession();
  ui.discovery.recipe = "hummus";
  ui.discovery.recipeSteps = steps;
  const html = recipeDetail({ state, ui });
  assert.equal(
    (html.match(/data-action="recipe-step"/g) || []).length,
    recipes[2].steps.length,
  );
  assert.match(html, /1\/3 passi completati/);
  assert.match(html, /data-action="recipe-save"/);
  assert.deepEqual(state.entries, []);
  assert.deepEqual(state.awards, []);
});

test("Recipe pantry lists actual catalog ingredients and shows when they are already present", () => {
  const state = initialState(),
    ui = initialSession();
  ui.discovery.recipe = "quinoa";
  assert.deepEqual(
    recipePantryFoods("quinoa").map((food) => food.id),
    ["quinoa", "pomodori", "ceci"],
  );
  state.fridge = ["quinoa", "pomodori"];
  state.pantryExtras = ["ceci"];
  const html = recipeDetail({ state, ui });
  assert.match(html, /Ingredienti del catalogo già in dispensa/);
  assert.match(html, /data-action="recipe-pantry" data-id="quinoa" disabled/);
  assert.match(html, /Cetriolo/);
  assert.match(html, /href="#frigo"/);
  state.recipeFavorites = ["quinoa"];
  const list = recipeList({ state, ui });
  assert.match(list, /Nelle tue preferite/);
  assert.match(
    list,
    /btn-active text-primary[^>]*data-action="recipe-favorite" data-id="quinoa"/,
  );
});

test("Moving a completed mission leaves the dashboard honest about its already earned reward", () => {
  const state = initialState();
  addEntry(state, { type: "movement", label: "Camminata", minutes: 10 });
  const entry = state.entries[0];
  updateEntry(state, entry.id, {
    date: shiftDate(localDate(), -1),
    minutes: 10,
  });
  const missionRow = dashboard({ state })
    .split("</li>")
    .find((text) => text.includes('href="#attivita"'));
  assert.match(missionRow, /Foglie di oggi già raccolte/);
  assert.doesNotMatch(missionRow, /\+25 foglie/);
  addEntry(state, { type: "movement", label: "Un altro gesto", minutes: 5 });
  assert.equal(totalPoints(state), 25);
  assert.match(
    dashboard({ state })
      .split("</li>")
      .find((text) => text.includes('href="#attivita"')),
    /Completato oggi/,
  );
});

test("Empty reports and zero-leaf rewards provide a relevant next action", () => {
  const state = initialState(),
    ui = initialSession();
  for (const type of ["movement", "sleep", "water"]) {
    ui.progress.category = type;
    assert.match(
      progress({ state, ui }),
      new RegExp(`data-action="open-entry" data-type="${type}"`),
    );
  }
  ui.progress.category = "mindful";
  assert.equal(habitLabels.mindful.label, "Pause per te");
  assert.match(progress({ state, ui }), /href="#stress"/);
  assert.match(progress({ state, ui }), /Inizia una pausa/);
  assert.match(rewardCollections({ state, ui }), /Raccogli le prime foglie/);
});
