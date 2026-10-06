import test from "node:test";
import assert from "node:assert/strict";
import { initialState, plateBalance } from "../assets/data.js";
import { plateFoods } from "../assets/js/nutrition-catalog.js";
import {
  plateSlots,
  plateBoard,
  ingredientPicker,
  fridgeMarket,
  fridgeShelves,
} from "../assets/js/ui/nutrition-widgets.js";
import { plate, fridge } from "../assets/js/views/nutrition.js";

test("The plate preserves original indices for duplicate portions and out-of-order choices", () => {
  const items = ["tofu", "broccoli", "quinoa", "broccoli"];
  const slots = plateSlots(items);
  assert.deepEqual(
    slots.map(({ group, food, index, matches }) => ({
      group,
      id: food?.id,
      index,
      matches,
    })),
    [
      { group: "vegetables", id: "broccoli", index: 1, matches: true },
      { group: "vegetables", id: "broccoli", index: 3, matches: true },
      { group: "carbs", id: "quinoa", index: 2, matches: true },
      { group: "protein", id: "tofu", index: 0, matches: true },
    ],
  );
  assert.deepEqual(items, ["tofu", "broccoli", "quinoa", "broccoli"]);
  const secondVegetable = slots[1];
  const afterRemoval = items.filter(
    (_, index) => index !== secondVegetable.index,
  );
  assert.deepEqual(afterRemoval, ["tofu", "broccoli", "quinoa"]);
  assert.equal(plateBalance(afterRemoval).balanced, false);
});

test("Excess groups remain visible and removable instead of overwriting compatible ingredients", () => {
  const items = ["pollo", "salmone", "quinoa", "broccoli"];
  const slots = plateSlots(items);
  assert.equal(slots[0].food.id, "broccoli");
  assert.equal(slots[1].food.id, "salmone");
  assert.equal(slots[1].matches, false);
  assert.equal(slots[1].index, 1);
  assert.equal(slots[2].food.id, "quinoa");
  assert.equal(slots[3].food.id, "pollo");
  assert.equal(new Set(slots.map((slot) => slot.index)).size, 4);
  assert.equal(plateBalance(items).balanced, false);
  const html = plateBoard(items);
  assert.match(html, /data-plate-match="false"/);
  assert.match(html, /una porzione di un altro gruppo/);
  assert.equal((html.match(/data-action="plate-remove"/g) || []).length, 4);
});

test("Empty plate sectors filter the three groups; a full plate exposes only removal actions", () => {
  const empty = plateBoard([]);
  assert.equal((empty.match(/data-plate-slot=/g) || []).length, 4);
  assert.equal((empty.match(/data-action="plate-target"/g) || []).length, 4);
  assert.equal((empty.match(/data-group="vegetables"/g) || []).length, 2);
  const full = plateBoard(["spinaci", "pomodori", "pane", "tofu"]);
  assert.equal((full.match(/data-item-index=/g) || []).length, 4);
  assert.doesNotMatch(full, /data-action="plate-target"/);
  assert.doesNotMatch(full, /undefined/);
});

test("Ingredient filters preserve repeated choices and disable adding a fifth portion", () => {
  const all = ingredientPicker([], null);
  assert.equal(
    (all.match(/data-action="plate-add"/g) || []).length,
    plateFoods.length,
  );
  const protein = ingredientPicker([], "protein");
  assert.equal((protein.match(/data-action="plate-add"/g) || []).length, 5);
  assert.match(protein, /data-id="salmone"/);
  assert.doesNotMatch(protein, /data-id="broccoli"/);
  const full = ingredientPicker(["broccoli", "broccoli", "pane", "tofu"]);
  assert.equal((full.match(/ disabled>/g) || []).length, plateFoods.length);
  assert.match(full, /2 porzioni già scelte/);
  assert.match(all, /id="plate-foods-target"/);
});

test("Fridge shelves expose only selected ingredients and preserve independent market toggles", () => {
  const items = ["broccoli", "quinoa", "tofu"];
  const shelves = fridgeShelves(items);
  const market = fridgeMarket(items);
  assert.equal((shelves.match(/data-fridge-shelf=/g) || []).length, 3);
  assert.equal((shelves.match(/data-fridge-item=/g) || []).length, 3);
  assert.match(shelves, /data-fridge-item="tofu"/);
  assert.doesNotMatch(shelves, /data-fridge-item="salmone"/);
  assert.equal(
    (market.match(/data-market-food=/g) || []).length,
    plateFoods.length,
  );
  assert.equal((market.match(/aria-pressed="true"/g) || []).length, 3);
  assert.match(fridgeShelves([]), /Questo ripiano aspetta i tuoi ingredienti/);
  assert.deepEqual(items, ["broccoli", "quinoa", "tofu"]);
});

test("Widget views keep incomplete checks and pantry suggestions disabled and retain extra ingredients", () => {
  const state = initialState();
  state.fridge = [];
  state.pantryExtras = ["ceci", "carote", "mela-rossa"];
  const before = JSON.stringify(state);
  const pantry = fridge({ state });
  assert.match(pantry, /data-action="pantry-plate" disabled/);
  assert.match(pantry, /data-action="market-toggle" data-id="ceci"/);
  assert.match(pantry, /Altri ingredienti del mercato/);
  assert.equal(JSON.stringify(state), before);
  const incomplete = plate({
    ui: { plate: { items: ["broccoli"], meal: "Pranzo", message: "" } },
  });
  assert.match(incomplete, /data-action="plate-check" disabled/);
  assert.doesNotMatch(incomplete, /data-action="plate-save"/);
  const balanced = plate({
    ui: {
      plate: {
        items: ["broccoli", "spinaci", "pane", "tofu"],
        meal: "Cena",
        message: "Piatto verificato.",
      },
    },
  });
  assert.match(balanced, /data-action="plate-save"/);
  assert.match(balanced, /<option selected>Cena<\/option>/);
});
