import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  localDate,
  addEntry,
  totalPoints,
} from "../assets/data.js";
import { initialSession } from "../assets/js/session.js";
import { reviewPractice } from "../assets/js/guided-flow.js";
import { meditations } from "../assets/js/guided-content.js";
import {
  createPracticeActions,
  pauseSummary,
  recordPause,
} from "../assets/js/practice-runtime.js";

const element = (practice, extra = {}) => ({
  dataset: { practice, ...extra },
});

function fixture({ allowed = true, saved = true, minutes = "8" } = {}) {
  const ui = initialSession(),
    state = initialState(),
    calls = {
      renders: 0,
      focuses: 0,
      checks: 0,
      saves: 0,
      reads: 0,
      errors: [],
      toasts: [],
      days: [],
    },
    options = { allowed, saved, minutes },
    actions = createPracticeActions({
      ui,
      store: { state },
      render: () => calls.renders++,
      focus: () => calls.focuses++,
      allowWrite: () => {
        calls.checks++;
        return options.allowed;
      },
      persist: () => {
        calls.saves++;
        return options.saved;
      },
      toast: (message) => calls.toasts.push(message),
      readMinutes: () => {
        calls.reads++;
        return options.minutes;
      },
      showError: (message) => calls.errors.push(message),
      showSavedDay: (date, id) => calls.days.push({ date, id }),
    });
  return { ui, state, calls, options, actions };
}

test("Wakeup requires actual whole minutes before checking or writing the diary", () => {
  for (const minutes of ["", "bad", "0", "-1", "1.5", "181", "Infinity"]) {
    const current = fixture({ minutes });
    current.ui.practices.wakeup = reviewPractice(["collo"]);
    const before = JSON.stringify(current.state);
    current.actions["practice-save"](element("wakeup"));
    assert.equal(JSON.stringify(current.state), before, minutes);
    assert.equal(current.ui.practices.wakeup.phase, "review", minutes);
    assert.equal(current.ui.practices.wakeup.minutes, minutes);
    assert.equal(current.calls.errors.length, 1);
    assert.equal(current.calls.checks, 0);
    assert.equal(current.calls.saves, 0);
    assert.deepEqual(current.calls.days, []);
  }
});

test("Wakeup records only completed gestures with the actual minutes and the saved entry identity", () => {
  const current = fixture({ minutes: "12" });
  current.ui.practices.wakeup = {
    ...reviewPractice(["collo", "braccia", "gambe"]),
    completed: ["collo", "gambe", "unknown", "collo"],
  };
  current.actions["practice-save"](element("wakeup"));
  const entry = current.state.entries[0],
    outcome = current.ui.practices.wakeup;
  assert.equal(current.state.entries.length, 1);
  assert.equal(entry.type, "movement");
  assert.equal(
    entry.label,
    "Risveglio muscolare: Rotazioni del collo, Piegamenti leggeri",
  );
  assert.equal(entry.minutes, 12);
  assert.equal(entry.date, localDate());
  assert.equal(outcome.phase, "complete");
  assert.equal(outcome.minutes, 12);
  assert.equal(outcome.entryId, entry.id);
  assert.equal(outcome.date, entry.date);
  assert.equal(outcome.saved, true);
  assert.equal(outcome.points, 25);
  assert.equal(totalPoints(current.state), 25);
  assert.equal(current.calls.saves, 1);
  assert.deepEqual(current.calls.days, [{ date: entry.date, id: entry.id }]);
  assert.equal(current.calls.renders, 1);
  assert.equal(current.calls.focuses, 1);
});

test("A temporary wakeup record remains complete and repeated save clicks cannot duplicate it", () => {
  const current = fixture({ saved: false, minutes: "9" });
  current.ui.practices.wakeup = reviewPractice(["braccia"]);
  current.actions["practice-save"](element("wakeup"));
  const after = JSON.stringify(current.state),
    entryId = current.ui.practices.wakeup.entryId;
  assert.equal(current.ui.practices.wakeup.phase, "complete");
  assert.equal(current.ui.practices.wakeup.saved, false);
  assert.ok(entryId);
  assert.match(current.calls.toasts[0], /sessione.*Esporta/);
  current.options.saved = true;
  current.actions["practice-save"](element("wakeup"));
  current.actions["practice-save"](element("wakeup"));
  assert.equal(JSON.stringify(current.state), after);
  assert.equal(current.ui.practices.wakeup.entryId, entryId);
  assert.equal(current.calls.saves, 1);
  assert.equal(current.calls.days.length, 1);
  assert.equal(current.calls.toasts.length, 1);
});

test("A protected path keeps the wakeup review and minutes without altering records or awards", () => {
  const current = fixture({ allowed: false, minutes: "14" });
  addEntry(current.state, { type: "sleep", hours: 7, label: "Il mio riposo" });
  current.ui.practices.wakeup = reviewPractice(["respiro"]);
  const before = JSON.stringify(current.state);
  current.actions["practice-save"](element("wakeup"));
  assert.equal(JSON.stringify(current.state), before);
  assert.equal(current.ui.practices.wakeup.phase, "review");
  assert.equal(current.ui.practices.wakeup.minutes, "14");
  assert.equal(current.ui.practices.wakeup.entryId, "");
  assert.equal(current.calls.checks, 1);
  assert.equal(current.calls.saves, 0);
  assert.equal(current.calls.renders, 0);
  assert.deepEqual(current.calls.days, []);
  current.options.allowed = true;
  current.actions["practice-save"](element("wakeup"));
  assert.equal(current.ui.practices.wakeup.phase, "complete");
  assert.equal(current.state.entries.length, 2);
  assert.equal(current.state.entries.at(-1).minutes, 14);
});

test("Skipped wakeup gestures cannot create a movement record, even with valid minutes", () => {
  const current = fixture();
  current.ui.practices.wakeup = { ...reviewPractice(["collo"]), completed: [] };
  const before = JSON.stringify(current.state);
  current.actions["practice-save"](element("wakeup"));
  assert.equal(JSON.stringify(current.state), before);
  assert.match(current.calls.errors[0], /almeno un gesto svolto/);
  assert.equal(current.ui.practices.wakeup.phase, "review");
  assert.equal(current.calls.reads, 0);
  assert.equal(current.calls.saves, 0);
});

test("Evening can conclude after skipping every gesture without writing sleep, minutes or leaves", () => {
  const current = fixture({ allowed: false, saved: false });
  addEntry(current.state, {
    type: "sleep",
    hours: 7.5,
    label: "Il mio riposo",
  });
  current.state.sleepRoutine = ["schermi", "luce"];
  const before = JSON.stringify(current.state);
  current.actions["practice-start"](element("evening"));
  current.actions["practice-begin"](element("evening"));
  current.actions["practice-skip"](element("evening"));
  current.actions["practice-skip"](element("evening"));
  assert.equal(current.ui.practices.evening.phase, "review");
  assert.deepEqual(current.ui.practices.evening.completed, []);
  current.actions["practice-save"](element("evening"));
  current.actions["practice-save"](element("evening"));
  assert.equal(current.ui.practices.evening.phase, "complete");
  assert.equal(JSON.stringify(current.state), before);
  assert.equal(current.calls.checks, 0);
  assert.equal(current.calls.saves, 0);
  assert.equal(current.calls.reads, 0);
  assert.deepEqual(current.calls.days, []);
});

test("Practice actions filter choices and keep a paused gesture from advancing", () => {
  const current = fixture();
  current.ui.guided.exerciseIds = ["unknown", "collo", "braccia", "collo"];
  current.actions["practice-start"](element("wakeup"));
  assert.deepEqual(current.ui.practices.wakeup.ids, ["collo", "braccia"]);
  current.actions["practice-begin"](element("wakeup"));
  current.actions["practice-toggle"](element("wakeup"));
  current.actions["practice-next"](element("wakeup"));
  current.actions["practice-skip"](element("wakeup"));
  assert.equal(current.ui.practices.wakeup.index, 0);
  assert.deepEqual(current.ui.practices.wakeup.completed, []);
  current.actions["practice-toggle"](element("wakeup"));
  current.actions["practice-next"](element("wakeup"));
  assert.equal(current.ui.practices.wakeup.index, 1);
  const before = JSON.stringify(current.ui.practices);
  current.actions["practice-save"](element("unknown"));
  assert.equal(JSON.stringify(current.ui.practices), before);
  assert.equal(current.state.entries.length, 0);
});

test("A blocked pause completion keeps an outcome without mutating the protected state", () => {
  const state = initialState();
  addEntry(state, { type: "movement", label: "Camminata", minutes: 20 });
  const before = JSON.stringify(state);
  let saves = 0;
  const blocked = recordPause({
    state,
    key: "pace",
    title: "Pace Interiore",
    minutes: 10,
    allowed: false,
    save: () => saves++,
  });
  assert.equal(JSON.stringify(state), before);
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.saved, false);
  assert.equal(blocked.entryId, "");
  assert.equal(blocked.minutes, 10);
  assert.equal(blocked.date, localDate());
  assert.equal(blocked.points, 0);
  assert.equal(saves, 0);
});

test("Completed pauses stay in memory on storage failure and award mindful leaves only once per day", () => {
  const state = initialState();
  let saves = 0;
  const record = (key, title, minutes, saved) =>
    recordPause({
      state,
      key,
      title,
      minutes,
      allowed: true,
      save: () => {
        saves++;
        return saved;
      },
    });
  const temporary = record("stress", "Pausa di respirazione", 1, false),
    pace = record("pace", "Pace Interiore", 10, true),
    bosco = record("bosco", "Bosco Incantato", 15, true);
  assert.equal(temporary.saved, false);
  assert.equal(temporary.blocked, false);
  assert.equal(temporary.points, 15);
  assert.equal(pace.saved, true);
  assert.equal(pace.points, 0);
  assert.equal(bosco.points, 0);
  assert.deepEqual(
    state.entries.map((entry) => entry.minutes),
    [1, 10, 15],
  );
  assert.deepEqual(
    state.entries.map((entry) => entry.label),
    ["Pausa di respirazione", "Pace Interiore", "Bosco Incantato"],
  );
  assert.ok(
    state.entries.every(
      (entry) => entry.type === "mindful" && entry.date === localDate(),
    ),
  );
  assert.equal(temporary.entryId, state.entries[0].id);
  assert.equal(pace.entryId, state.entries[1].id);
  assert.equal(bosco.entryId, state.entries[2].id);
  assert.equal(new Set(state.entries.map((entry) => entry.id)).size, 3);
  assert.equal(
    state.awards.filter(
      (award) => award.id === "mission:mindful" && award.date === localDate(),
    ).length,
    1,
  );
  assert.equal(totalPoints(state), 15);
  assert.equal(saves, 3);
});

test("A prior day's mindful award does not suppress today's completion award", () => {
  const state = initialState();
  addEntry(
    state,
    { type: "mindful", label: "Pausa precedente", minutes: 3 },
    "2000-01-01",
  );
  const outcome = recordPause({
    state,
    key: "respiro",
    title: "Respiro Profondo",
    minutes: 5,
    allowed: true,
    save: () => true,
  });
  assert.equal(outcome.points, 15);
  assert.equal(totalPoints(state), 30);
  assert.equal(state.awards.length, 2);
  assert.equal(state.awards.at(-1).date, localDate());
});

test("Pause summary prefers the running session, then a suspended pause, and omits idle completions", () => {
  const snapshots = {
      stress: { running: false, started: true, remaining: 50 },
      pace: { running: false, started: true, remaining: 499 },
      bosco: { running: true, started: true, remaining: 801 },
      respiro: { running: false, started: false, remaining: 300 },
    },
    timer = (key) => ({ snapshot: () => ({ ...snapshots[key] }) }),
    guided = new Map(
      meditations.map((session) => [session.id, timer(session.id)]),
    );
  assert.deepEqual(pauseSummary(timer("stress"), guided, meditations), {
    route: "sessione/bosco",
    title: "Bosco Incantato",
    remaining: 801,
    running: true,
  });
  snapshots.bosco.running = false;
  assert.deepEqual(pauseSummary(timer("stress"), guided, meditations), {
    route: "stress",
    title: "Respirazione con Pigna",
    remaining: 50,
    running: false,
  });
  snapshots.stress.started = false;
  assert.deepEqual(pauseSummary(timer("stress"), guided, meditations), {
    route: "sessione/pace",
    title: "Pace Interiore",
    remaining: 499,
    running: false,
  });
  for (const snapshot of Object.values(snapshots)) {
    snapshot.running = false;
    snapshot.started = false;
  }
  assert.equal(pauseSummary(timer("stress"), guided, meditations), null);
});
