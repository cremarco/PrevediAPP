import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  parseState,
  award,
  claimReward,
  availablePoints,
  totalPoints,
} from "../assets/data.js";
import { readBackup } from "../assets/js/backup.js";
import {
  findFoods,
  recipeById,
  initialFridgeGame,
  answerFridgeGame,
} from "../assets/js/nutrition-catalog.js";
import { createStore } from "../assets/js/store.js";
import { createTimer } from "../assets/js/timer.js";
import { resolveRoute } from "../assets/js/router.js";

test("Existing v1 saves gain defaults and extension preferences round-trip in backups", () => {
  const old = parseState(
    JSON.stringify({ version: 1, entries: [], awards: [], name: "Prova" }),
  );
  assert.deepEqual(old.glucoseReadings, []);
  assert.deepEqual(old.sleepRoutine, []);
  assert.equal(old.sleepReminder.enabled, false);
  const state = initialState();
  Object.assign(state, {
    recipeFavorites: ["hummus"],
    foodSearches: ["Quinoa"],
    pantryExtras: ["ceci"],
    joinedChallenges: ["mindful-week"],
    sleepRoutine: ["lettura"],
    sleepReminder: { enabled: true, time: "22:15" },
    joined: ["walkers", "breathing"],
  });
  state.glucoseReadings = [
    {
      id: "synthetic-1",
      date: "2026-10-05",
      time: "08:30",
      value: 103.5,
      context: "PROVA SINTETICA",
      notes: "Test",
      createdAt: "2026-10-05T06:30:00.000Z",
    },
  ];
  assert.deepEqual(readBackup(JSON.stringify(state)), state);
});
test("A malformed optional glucose record protects the original file instead of silently discarding it", () => {
  const state = initialState();
  state.glucoseReadings = [
    { id: "synthetic-1", date: "2026-10-05", time: "08:30", value: "corrotto" },
  ];
  let raw = JSON.stringify(state);
  const store = createStore(() => ({
    getItem: () => raw,
    setItem: (key, value) => (raw = value),
  }));
  assert.equal(store.recoveryRequired, true);
  assert.equal(store.recoveryRaw, raw);
  assert.equal(store.save(), false);
  assert.throws(() => readBackup(raw));
});
test("Food discovery normalizes accents and category filters and rejects unknown recipe identities", () => {
  assert.equal(findFoods("MÉLA").length, 3);
  assert.ok(findFoods("", "carbs").some((food) => food.id === "avena"));
  assert.equal(findFoods("zzzz").length, 0);
  assert.equal(recipeById("__proto__").id, "quinoa");
});
test("Fridge game ignores actions before starting, advances correct groups and stops after three errors", () => {
  const game = initialFridgeGame();
  assert.equal(answerFridgeGame(game, "broccoli"), false);
  game.started = true;
  assert.equal(answerFridgeGame(game, "bad"), false);
  answerFridgeGame(game, "broccoli");
  assert.equal(game.index, 1);
  assert.equal(game.correct, 1);
  answerFridgeGame(game, "tofu");
  answerFridgeGame(game, "tofu");
  answerFridgeGame(game, "tofu");
  assert.equal(game.lives, 0);
  assert.equal(game.finished, true);
  assert.equal(answerFridgeGame(game, "quinoa"), false);
});
test("New virtual reward collections spend the same leaves once and preserve lifetime level", () => {
  const state = initialState();
  award(state, "synthetic-award", 300);
  assert.equal(claimReward(state, "scarf"), true);
  assert.equal(availablePoints(state), 150);
  assert.equal(totalPoints(state), 300);
  assert.equal(claimReward(state, "scarf"), false);
  assert.deepEqual(readBackup(JSON.stringify(state)).claimed, ["scarf"]);
});
test("Dedicated detail routes preserve safe IDs while malformed or inherited routes fall back", () => {
  for (const [hash, id] of [
    ["#ricetta/hummus", "hummus"],
    ["#gruppo/walkers", "walkers"],
    ["#sessione/bosco", "bosco"],
    ["#impara/sonno", "sonno"],
  ])
    assert.equal(resolveRoute(hash).detail, id);
  assert.equal(resolveRoute("#ricetta/<script>").detail, "");
  assert.equal(resolveRoute("#constructor").view, "percorso");
});
test("Configured timers use their own exact duration and complete once after a suspended tab", () => {
  let callback,
    now = 0,
    completed = 0;
  const timer = createTimer({
    durations: [30],
    initialDuration: 30,
    now: () => now,
    schedule: (fn) => {
      callback = fn;
      return 1;
    },
    cancel: () => {},
    onComplete: () => completed++,
  });
  timer.setDuration(600);
  assert.equal(timer.snapshot().duration, 30);
  timer.toggle();
  now = 30001;
  callback();
  assert.equal(completed, 1);
  const meditation = createTimer({ durations: [900], initialDuration: 900 });
  assert.equal(meditation.snapshot().remaining, 900);
});

test("The garden names every owned collection item without unresolved selector labels", async () => {
  const { rewards } = await import("../assets/data.js");
  const { garden } = await import("../assets/js/views/journey.js");
  const state = initialState();
  award(state, "synthetic-reward-budget", 2000);
  for (const reward of rewards.filter((item) => item.preview)) {
    assert.equal(claimReward(state, reward.id), true);
  }
  state.decoration = "scarf";
  const html = garden({ state });
  assert.doesNotMatch(html, /undefined/);
  for (const reward of rewards.filter((item) => item.preview))
    assert.ok(html.includes(reward.name));
});
