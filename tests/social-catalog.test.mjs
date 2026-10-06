import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../assets/data.js";
import {
  filterGroups,
  challengeProgress,
  groups,
  challenges,
} from "../assets/js/social-catalog.js";
import {
  groupsCatalog,
  groupDetail,
} from "../assets/js/views/social-discovery.js";

const record = (id, type, date, fields = {}) => ({ id, type, date, ...fields });

test("Group search combines case/accent insensitive text with a category and safe fallback", () => {
  assert.equal(filterGroups("MEDITAZIONE", "stress")[0].id, "meditation");
  assert.equal(filterGroups("attivita", "attivita").length, 1);
  assert.equal(filterGroups("bosco", "alimentazione").length, 0);
  assert.equal(filterGroups("", "sonno").length, 0);
  assert.equal(filterGroups(null, "unknown").length, groups.length);
});

test("Challenges count actual distinct days inside the rolling period, excluding invalid and future entries", () => {
  const state = initialState();
  state.entries = [
    record("a", "movement", "2026-10-01", { minutes: 10 }),
    record("b", "movement", "2026-10-01", { minutes: 20 }),
    record("c", "movement", "2026-10-06", { minutes: 5 }),
    record("d", "movement", "2026-09-29", { minutes: 5 }),
    record("e", "movement", "2026-10-07", { minutes: 5 }),
    record("f", "movement", "2026-02-30", { minutes: 5 }),
    record("g", "movement", "2026-10-04", { minutes: 0 }),
    record("h", "mindful", "2026-10-04", { minutes: 3 }),
  ];
  const before = JSON.stringify(state);
  const result = challengeProgress(state, "movement-week", "2026-10-06");
  assert.equal(result.current, 2);
  assert.equal(result.target, 3);
  assert.equal(result.done, false);
  assert.equal(JSON.stringify(state), before);
  assert.equal(challengeProgress(state, "unknown", "2026-10-06"), null);
  assert.equal(challengeProgress(state, "movement-week", "bad"), null);
});

test("Meal challenges count records once; challenge membership does not change results or awards", () => {
  const state = initialState();
  const meal = record("a", "meal", "2026-10-06", { label: "Pasto" });
  state.entries = [
    meal,
    meal,
    record("b", "meal", "2026-10-06", { label: "Cena" }),
  ];
  const before = challengeProgress(state, "meal-week", "2026-10-06");
  state.joinedChallenges = ["meal-week"];
  assert.equal(before.current, 2);
  assert.deepEqual(challengeProgress(state, "meal-week", "2026-10-06"), before);
  assert.equal(state.awards.length, 0);
});

test("Hydration challenge follows the personal goal and never substitutes liters for glasses", () => {
  const state = initialState();
  state.goals.water = 2;
  state.entries = [
    record("a", "water", "2026-10-06"),
    record("b", "water", "2026-10-06"),
    record("c", "water", "2026-10-05"),
  ];
  const result = challengeProgress(state, "water-today", "2026-10-06");
  assert.equal(result.current, 2);
  assert.equal(result.target, 2);
  assert.equal(result.percent, 100);
  assert.equal(result.unit, "bicchieri");
  assert.equal(result.done, true);
  state.goals.water = NaN;
  assert.equal(challengeProgress(state, "water-today", "2026-10-06").target, 8);
});

test("Group renderers escape searches and offer recovery for unknown detail IDs", () => {
  const state = initialState();
  const html = groupsCatalog({
    state,
    ui: { social: { query: '\"><script>alert(1)</script>', category: "all" } },
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  const unknown = groupDetail({
    state,
    ui: { social: { groupId: "missing" } },
  });
  assert.match(unknown, /href="#gruppi"/);
  assert.doesNotMatch(unknown, /data-action="join-group"/);
  assert.equal(
    new Set(challenges.map((challenge) => challenge.id)).size,
    challenges.length,
  );
});
