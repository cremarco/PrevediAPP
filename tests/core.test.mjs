import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  addEntry,
  totalPoints,
  availablePoints,
  award,
  claimReward,
  plateBalance,
  riskScore,
  parseState,
  localDate,
} from "../assets/data.js";
test("Mission points awarded once per category per day, including after deletion", () => {
  const s = initialState();
  addEntry(s, { type: "meal", label: "Pranzo" }, "2026-10-05");
  addEntry(s, { type: "meal", label: "Cena" }, "2026-10-05");
  assert.equal(totalPoints(s), 20);
  s.entries = [];
  addEntry(s, { type: "meal" }, "2026-10-05");
  assert.equal(totalPoints(s), 20);
  addEntry(s, { type: "meal" }, "2026-10-06");
  assert.equal(totalPoints(s), 40);
});
test("Rewards spend available leaves once and preserve lifetime growth", () => {
  const s = initialState();
  assert.equal(claimReward(s, "nest"), false);
  award(s, "earned", 100);
  assert.equal(claimReward(s, "nest"), true);
  assert.equal(availablePoints(s), 40);
  assert.equal(totalPoints(s), 100);
  assert.equal(claimReward(s, "nest"), false);
  assert.equal(claimReward(s, "stars"), false);
});
test("Plate balances actual portions, with repeated ingredients supported", () => {
  assert.equal(
    plateBalance(["broccoli", "broccoli", "quinoa", "tofu"]).balanced,
    true,
  );
  assert.equal(
    plateBalance(["broccoli", "pollo", "quinoa", "riso"]).balanced,
    false,
  );
  assert.deepEqual(plateBalance([]).percent, {
    vegetables: 0,
    carbs: 0,
    protein: 0,
  });
});
test("CDC score: age thresholds, high-risk threshold, sex, gestational and BMI", () => {
  const base = {
    age: 30,
    sex: "female",
    gestational: false,
    family: false,
    pressure: false,
    active: true,
    height: 170,
    weight: 60,
    asian: false,
  };
  assert.equal(riskScore(base).score, 0);
  assert.equal(riskScore({ ...base, age: 40 }).score, 1);
  assert.equal(riskScore({ ...base, age: 50 }).score, 2);
  assert.equal(riskScore({ ...base, age: 60 }).score, 3);
  assert.equal(
    riskScore({ ...base, age: 60, sex: "male", family: true }).high,
    true,
  );
  assert.equal(riskScore({ ...base, gestational: true }).score, 1);
  assert.equal(riskScore({ ...base, weight: 70, asian: true }).score, 1);
  assert.equal(riskScore({ ...base, weight: 70 }).score, 0);
  assert.equal(riskScore({ ...base, height: 200, weight: 160 }).score, 3);
  assert.throws(() => riskScore({ ...base, height: 0 }));
});
test("Saved state tolerates missing optional fields but rejects invalid schema", () => {
  assert.equal(parseState(null).entries.length, 0);
  assert.equal(
    parseState(JSON.stringify({ version: 1, entries: [], awards: [] })).goals
      .sleep,
    8,
  );
  assert.throws(() => parseState("{}"));
  const s = initialState();
  s.entries = [null, { type: "meal", id: "x", date: "junk" }];
  s.awards = [{ id: "bad", date: "x", points: "500" }];
  const parsed = parseState(JSON.stringify(s));
  assert.equal(parsed.entries.length, 0);
  assert.equal(totalPoints(parsed), 0);
});
test("Day keys use Europe/Rome instead of UTC at midnight boundary", () => {
  assert.equal(localDate(new Date("2026-10-04T22:30:00Z")), "2026-10-05");
});
