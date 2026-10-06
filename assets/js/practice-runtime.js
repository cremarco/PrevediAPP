import { addEntry, localDate, totalPoints } from "../data.js";
import {
  validExerciseIds,
  validRoutineIds,
  validExerciseMinutes,
  exerciseLabel,
} from "./guided-content.js";
import {
  initialPractice,
  beginPractice,
  reviewPractice,
  activatePractice,
  stepPractice,
  pausePractice,
  previousPractice,
} from "./guided-flow.js";

/** Own manual practice actions while the shell owns DOM, storage and focus. */
export function createPracticeActions({
  ui,
  store,
  render,
  focus,
  allowWrite,
  persist,
  toast,
  readMinutes,
  showError,
  showSavedDay,
  prepare = () => {},
}) {
  const kind = (element) =>
    ["wakeup", "evening"].includes(element?.dataset?.practice)
      ? element.dataset.practice
      : null;
  const update = (element, transition) => {
    const key = kind(element);
    if (!key) return;
    ui.practices[key] = transition(ui.practices[key], key);
    render();
    focus();
  };

  return {
    "practice-start": (element) =>
      update(element, (_, key) => {
        const ids =
          key === "wakeup"
            ? validExerciseIds(ui.guided.exerciseIds)
            : validRoutineIds(store.state.sleepRoutine);
        return element.dataset.mode === "review"
          ? reviewPractice(ids)
          : beginPractice(ids);
      }),
    "practice-begin": (element) =>
      update(element, (practice) => {
        if (practice.phase === "prepare") prepare();
        return activatePractice(practice);
      }),
    "practice-toggle": (element) =>
      update(element, (practice) => {
        if (practice.phase === "active" && practice.paused) prepare();
        return pausePractice(practice);
      }),
    "practice-next": (element) =>
      update(element, (practice) => stepPractice(practice, "done")),
    "practice-skip": (element) =>
      update(element, (practice) => stepPractice(practice, "skip")),
    "practice-back": (element) => update(element, previousPractice),
    "practice-reset": (element) => update(element, initialPractice),
    "practice-save": (element) => {
      const key = kind(element);
      if (!key) return;
      const practice = ui.practices[key];
      if (practice.phase !== "review") return;
      const completed =
        key === "wakeup"
          ? validExerciseIds(practice.completed)
          : validRoutineIds(practice.completed);
      if (key === "wakeup" && !completed.length) {
        showError("Segna almeno un gesto svolto prima di concludere.");
        return;
      }
      if (key === "evening") {
        ui.practices[key] = { ...practice, phase: "complete" };
        render();
        focus();
        return;
      }
      const value = readMinutes();
      practice.minutes = value;
      const minutes = validExerciseMinutes(value);
      if (minutes === null) {
        showError("Inserisci i minuti effettivi, da 1 a 180, senza decimali.");
        return;
      }
      if (!allowWrite()) return;
      const before = totalPoints(store.state);
      addEntry(store.state, {
        type: "movement",
        label: `Risveglio muscolare: ${exerciseLabel(completed)}`,
        minutes,
      });
      const entry = store.state.entries.at(-1);
      const saved = persist();
      ui.practices[key] = {
        ...practice,
        phase: "complete",
        minutes,
        entryId: entry.id,
        date: entry.date,
        saved,
        points: totalPoints(store.state) - before,
      };
      render();
      focus();
      toast(
        saved
          ? "Routine registrata nel diario con i minuti che hai indicato."
          : "Routine disponibile in questa sessione. Esporta una copia per conservarla.",
      );
      showSavedDay(entry.date, entry.id);
    },
  };
}

export function pauseSummary(timer, guidedTimers, sessions) {
  const pauses = [
    { route: "stress", title: "Respirazione con Pigna", timer },
    ...sessions.map((session) => ({
      route: `sessione/${session.id}`,
      title: session.title,
      timer: guidedTimers.get(session.id),
    })),
  ].map((pause) => ({ ...pause, snapshot: pause.timer.snapshot() }));
  const current =
    pauses.find((pause) => pause.snapshot.running) ||
    pauses.find((pause) => pause.snapshot.started);
  return current
    ? {
        route: current.route,
        title: current.title,
        remaining: current.snapshot.remaining,
        running: current.snapshot.running,
      }
    : null;
}

export function recordPause({ state, key, title, minutes, allowed, save }) {
  const date = localDate();
  if (!allowed)
    return {
      date,
      minutes,
      entryId: "",
      points: 0,
      saved: false,
      blocked: true,
    };
  const before = totalPoints(state);
  addEntry(state, { type: "mindful", label: title, minutes }, date);
  const entry = state.entries.at(-1);
  return {
    key,
    date: entry.date,
    minutes,
    entryId: entry.id,
    points: totalPoints(state) - before,
    saved: save(),
    blocked: false,
  };
}
