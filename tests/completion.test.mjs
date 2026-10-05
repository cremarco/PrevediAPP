import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  parseState,
  addEntry,
  totalPoints,
  award,
  localDate,
} from "../assets/data.js";
import {
  validDate,
  shiftDate,
  validateEntry,
  updateEntry,
  removeRecord,
  restoreRecord,
  savePost,
} from "../assets/js/records.js";
import {
  habitReport,
  milestones,
  pantryPlate,
  quizSummary,
} from "../assets/js/insights.js";
import { readBackup, MAX_BACKUP_BYTES } from "../assets/js/backup.js";
import { createStore } from "../assets/js/store.js";
import { entryDialog, backupDialog } from "../assets/js/ui/dialogs.js";
import { entryList, alberello } from "../assets/js/ui/components.js";
import { initialSession } from "../assets/js/session.js";
import { diaryCSV } from "../assets/js/export.js";

test("Calendar validation rejects impossible days and shifts across leap years and DST", () => {
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
  assert.equal(shiftDate("2026-03-29", 1), "2026-03-30");
  assert.equal(shiftDate("2026-01-01", -1), "2025-12-31");
});

test("Entry validation rejects future dates, empty descriptions and non-finite quantities", () => {
  const date = localDate();
  assert.throws(() => validateEntry({ type: "meal", date, label: "   " }));
  assert.throws(() =>
    validateEntry({ type: "water", date: shiftDate(date, 1) }),
  );
  assert.throws(() =>
    validateEntry({ type: "movement", date, minutes: "bad" }),
  );
  assert.throws(() => validateEntry({ type: "sleep", date, hours: 25 }));
  assert.equal(
    validateEntry({ type: "water", date, notes: "x".repeat(500) }).notes.length,
    300,
  );
});

test("Editing preserves identity, original timestamps and earned leaves even when moving a day", () => {
  const state = initialState();
  addEntry(state, { type: "movement", label: "Camminata", minutes: 20 });
  const original = state.entries[0];
  const date = shiftDate(localDate(), -1);
  updateEntry(state, original.id, {
    type: "meal",
    date,
    minutes: 35,
    label: "Bicicletta",
    notes: "Una pausa",
  });
  assert.equal(state.entries[0].id, original.id);
  assert.equal(state.entries[0].createdAt, original.createdAt);
  assert.equal(state.entries[0].type, "movement");
  assert.equal(state.entries[0].date, date);
  assert.equal(state.entries[0].minutes, 35);
  assert.equal(totalPoints(state), 25);
  assert.throws(() =>
    updateEntry(state, original.id, { date, minutes: Infinity }),
  );
  assert.equal(state.entries[0].minutes, 35);
});

test("Removal can be undone once in its original position without creating another reward", () => {
  const state = initialState();
  addEntry(state, { type: "meal", label: "Pranzo" });
  addEntry(state, { type: "meal", label: "Cena" });
  const id = state.entries[0].id;
  const removed = removeRecord(state.entries, id);
  assert.equal(state.entries.length, 1);
  assert.equal(restoreRecord(state.entries, removed), true);
  assert.equal(state.entries[0].id, id);
  assert.equal(restoreRecord(state.entries, removed), false);
  assert.equal(totalPoints(state), 20);
});

test("Community messages validate, edit and respect the local twenty-message limit", () => {
  const state = initialState();
  const post = savePost(state, "  Un piccolo passo  ");
  assert.equal(post.text, "Un piccolo passo");
  const time = post.createdAt;
  savePost(state, "Un altro pensiero", post.id);
  assert.equal(state.posts.length, 1);
  assert.equal(post.createdAt, time);
  assert.throws(() => savePost(state, ""));
  assert.throws(() => savePost(state, "x".repeat(401)));
  for (let i = 1; i < 20; i++) savePost(state, `Prova ${i}`);
  assert.throws(() => savePost(state, "Ventunesimo messaggio"));
});

test("Reports exclude outside dates and sum movement, water and breathing in the selected period", () => {
  const state = initialState();
  const today = localDate();
  addEntry(state, { type: "movement", minutes: 20 }, today);
  addEntry(state, { type: "movement", minutes: 15 }, today);
  addEntry(state, { type: "movement", minutes: 70 }, shiftDate(today, -8));
  addEntry(state, { type: "water" }, today);
  addEntry(state, { type: "water" }, today);
  addEntry(state, { type: "mindful", minutes: 3 }, today);
  assert.equal(habitReport(state, "movement").total, 35);
  assert.equal(habitReport(state, "movement", 30).total, 105);
  assert.equal(habitReport(state, "water").total, 2);
  assert.equal(habitReport(state, "mindful").total, 3);
  assert.equal(habitReport(state, "movement").registeredDays, 1);
});

test("Sleep reports use the latest entry per day and average only nights with a record", () => {
  const state = initialState();
  const today = localDate();
  addEntry(state, { type: "sleep", hours: 5 }, today);
  addEntry(state, { type: "sleep", hours: 8 }, today);
  addEntry(state, { type: "sleep", hours: 6 }, shiftDate(today, -1));
  const report = habitReport(state, "sleep");
  assert.equal(report.average, 7);
  assert.equal(report.registeredDays, 2);
  assert.equal(report.values.at(-1), 8);
  assert.equal(habitReport(initialState(), "sleep").average, 0);
});

test("Garden milestones depend on real records and accept non-consecutive days and legacy quizzes", () => {
  const state = initialState();
  assert.equal(
    milestones(state).some((stage) => stage.done),
    false,
  );
  for (const type of ["meal", "movement", "sleep", "mindful"])
    addEntry(state, { type });
  for (let i = 1; i < 7; i++)
    addEntry(state, { type: "water" }, shiftDate(localDate(), -i * 2));
  for (const category of ["alimentazione", "attivita", "sonno", "stress"])
    award(state, `quiz:${category}`, 20);
  assert.equal(
    milestones(state).every((stage) => stage.done),
    true,
  );
  const total = totalPoints(state);
  milestones(state);
  assert.equal(totalPoints(state), total);
});

test("Pantry suggestions require all three groups and reuse a single vegetable as two portions", () => {
  assert.deepEqual(pantryPlate(["tofu"]).missing, ["vegetables", "carbs"]);
  assert.deepEqual(pantryPlate(["broccoli", "tofu", "quinoa"]).items, [
    "broccoli",
    "broccoli",
    "quinoa",
    "tofu",
  ]);
  assert.deepEqual(
    pantryPlate(["spinaci", "broccoli", "riso", "pollo"]).items,
    ["broccoli", "spinaci", "riso", "pollo"],
  );
});

test("Quiz summaries preserve old completion records without inventing a historical score", () => {
  const state = initialState();
  award(state, "quiz:sonno", 20);
  assert.deepEqual(quizSummary(state, "sonno"), {
    attempts: 0,
    best: null,
    completed: true,
  });
  state.quizHistory = [
    { category: "sonno", correct: 1 },
    { category: "sonno", correct: 3 },
  ];
  assert.deepEqual(quizSummary(state, "sonno"), {
    attempts: 2,
    best: 3,
    completed: true,
  });
});

test("Old v1 saves receive optional fields; malformed new records are normalized and bounded", () => {
  const old = parseState(
    JSON.stringify({ version: 1, entries: [], awards: [] }),
  );
  assert.deepEqual(old.posts, []);
  assert.deepEqual(old.quizHistory, []);
  const value = {
    ...initialState(),
    posts: [null, { id: "a", text: "test", createdAt: null }],
    quizHistory: [{ category: "bad", correct: 99, date: localDate() }],
  };
  const parsed = parseState(JSON.stringify(value));
  assert.equal(parsed.posts.length, 1);
  assert.equal(parsed.posts[0].createdAt, "");
  assert.equal(parsed.quizHistory.length, 0);
});

test("Backup round-trip retains notes, pantry, chat, decorations and new local records", () => {
  const state = initialState();
  state.name = "Prova";
  state.fridge = ["tofu"];
  state.chat = [{ role: "user", text: "Una sera tranquilla" }];
  addEntry(state, {
    type: "movement",
    minutes: 15,
    label: "Camminata",
    notes: "Nel verde",
  });
  savePost(state, "Un passo locale");
  const restored = readBackup(JSON.stringify(state));
  assert.equal(restored.entries[0].notes, "Nel verde");
  assert.deepEqual(restored.fridge, state.fridge);
  assert.deepEqual(restored.chat, state.chat);
  assert.equal(restored.posts[0].text, "Un passo locale");
  assert.equal(totalPoints(restored), totalPoints(state));
});

test("Backup rejects unreadable, oversized, duplicate and incoherent data before replacement", () => {
  assert.throws(() => readBackup("{broken"));
  assert.throws(() => readBackup("{}"));
  assert.throws(() => readBackup(" ".repeat(MAX_BACKUP_BYTES + 1)));
  const state = initialState();
  addEntry(state, { type: "water" });
  state.entries.push(state.entries[0]);
  assert.throws(() => readBackup(JSON.stringify(state)));
  state.entries.pop();
  state.claimed = ["nest"];
  assert.throws(() => readBackup(JSON.stringify(state)));
});

test("Backup imports only known product fields and failed store replacement is atomic", () => {
  const source = {
    ...initialState(),
    height: 170,
    externalField: "unexpected",
  };
  const restored = readBackup(JSON.stringify(source));
  assert.equal(Object.hasOwn(restored, "height"), false);
  assert.equal(Object.hasOwn(restored, "externalField"), false);
  const store = createStore(() => ({ getItem: () => null, setItem: () => {} }));
  store.state.name = "Attuale";
  assert.throws(() => store.replace({ version: 2 }));
  assert.equal(store.state.name, "Attuale");
  store.replace({ ...restored, name: "Ripristinato" });
  assert.equal(store.state.name, "Ripristinato");
});

test("User content is escaped in diary and dialogs; garden uses only owned image variants", () => {
  const state = initialState();
  const entry = {
    id: "x",
    type: "meal",
    date: localDate(),
    label: "<script>alert(1)</script>",
    notes: "<img src=x>",
    meal: "Cena",
  };
  assert.doesNotMatch(entryList([entry]), /<script>|<img src=x>/);
  assert.match(entryDialog("meal", localDate(), entry), /&lt;script&gt;/);
  assert.match(
    backupDialog({ ...state, name: "<script>" }, "copy.json"),
    /&lt;script&gt;/,
  );
  state.decoration = "stars";
  assert.match(alberello(state), /alberello-original\.png/);
  state.claimed = ["stars"];
  assert.match(alberello(state), /garden-stars\.webp/);
});

test("Diary exports include safe quoted multiline personal notes", () => {
  const csv = diaryCSV([
    { date: localDate(), type: "water", notes: '@formula\n"due righe"' },
  ]);
  assert.match(csv, /"Note"/);
  assert.match(csv, /"'@formula\n""due righe"""/);
  assert.equal(initialSession().progress.period, 7);
});
