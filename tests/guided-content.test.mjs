import test from "node:test";
import assert from "node:assert/strict";
import { initialState, localDate } from "../assets/data.js";
import {
  exercises,
  meditations,
  validExerciseIds,
  validRoutineIds,
  validExerciseMinutes,
  exerciseLabel,
  safeSession,
} from "../assets/js/guided-content.js";
import {
  wakeup,
  guidedSession,
  movementDetail,
} from "../assets/js/views/guided.js";

test("Guided selections reject unrecognized input and provide a usable diary label", () => {
  assert.deepEqual(
    validExerciseIds(["collo", "unknown", null, "collo", "braccia"]),
    ["collo", "braccia"],
  );
  assert.deepEqual(validExerciseIds("collo"), []);
  assert.deepEqual(validRoutineIds(["schermi", "luce", "__proto__", "luce"]), [
    "schermi",
    "luce",
  ]);
  assert.equal(
    exerciseLabel(["braccia", "gambe", "braccia"]),
    "Allungamento braccia, Piegamenti leggeri",
  );
  for (const value of ["", 0, -1, 1.5, 181, Infinity, "bad"])
    assert.equal(validExerciseMinutes(value), null);
  assert.equal(validExerciseMinutes("5"), 5);
  assert.equal(validExerciseMinutes(180), 180);
  assert.ok(Object.isFrozen(exercises) && exercises.every(Object.isFrozen));
});

test("Unknown session links use a known session and rendering reflects the timer snapshot", () => {
  assert.equal(safeSession("__proto__").id, "pace");
  assert.equal(safeSession("<script>").id, "pace");
  assert.equal(safeSession("bosco").minutes, 15);
  assert.equal(meditations.length, 3);
  const paused = guidedSession(
    {
      guidedTimer: {
        duration: 600,
        remaining: 513,
        running: false,
        started: true,
      },
    },
    "pace",
  );
  assert.match(paused, />8:33<\/div>/);
  assert.match(paused, /Pausa sospesa/);
  assert.match(paused, /Riprendi/);
  assert.match(paused, /value="87" max="600"/);
  const unknown = guidedSession(
    { guidedTimer: { remaining: NaN } },
    "<script>",
  );
  assert.match(unknown, /Pace Interiore/);
  assert.doesNotMatch(unknown, /<script>|NaN|undefined/);
});

test("Routine registration requires a selection and movement detail shows recorded minutes", () => {
  const none = wakeup({
    ui: { guided: { exerciseIds: ["unknown"], exerciseMinutes: 5 } },
  });
  assert.match(none, /data-action="practice-start"[^>]*disabled/);
  const chosen = wakeup({
    ui: { guided: { exerciseIds: ["collo"], exerciseMinutes: 12 } },
  });
  assert.match(chosen, /data-action="practice-start"[^>]*data-mode="review"/);
  assert.doesNotMatch(chosen, /data-action="practice-start"[^>]*disabled/);
  assert.doesNotMatch(chosen, /id="practice-minutes"/);
  const state = initialState();
  state.entries.push({
    id: "walk",
    type: "movement",
    date: localDate(),
    minutes: 12,
    label: "Camminata",
  });
  const before = JSON.stringify(state);
  const html = movementDetail({ state });
  assert.match(html, /12 di 30 minuti scelti da te/);
  assert.match(html, /Non registrato/);
  assert.doesNotMatch(html, /348 kcal|7\.420|undefined|NaN/);
  assert.equal(JSON.stringify(state), before);
});
