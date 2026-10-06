import test from "node:test";
import assert from "node:assert/strict";
import {
  initialPractice,
  beginPractice,
  activatePractice,
  reviewPractice,
  stepPractice,
  pausePractice,
  previousPractice,
  guidedStage,
} from "../assets/js/guided-flow.js";
import { meditations } from "../assets/js/guided-content.js";
import { initialState, addEntry, totalPoints } from "../assets/data.js";
import { removeRecord, restoreRecord } from "../assets/js/records.js";
import {
  wakeup,
  sleepGuide,
  guidedSession,
  mindfulness,
  benessereHub,
} from "../assets/js/views/guided.js";
import { stress } from "../assets/js/views/wellness.js";
import { pauseOutcome } from "../assets/js/ui/guided-widgets.js";

test("Preparation copies the selection and a manual practice can finish a subset", () => {
  const ids = ["collo", "braccia", "gambe"],
    prepared = beginPractice(ids),
    before = JSON.stringify(prepared);
  assert.equal(prepared.phase, "prepare");
  assert.equal(prepared.minutes, "");
  ids.push("respiro");
  assert.deepEqual(prepared.ids, ["collo", "braccia", "gambe"]);
  const first = activatePractice(prepared),
    second = stepPractice(first, "done"),
    third = stepPractice(second, "skip"),
    review = stepPractice(third, "done");
  assert.equal(first.index, 0);
  assert.equal(second.index, 1);
  assert.deepEqual(third.completed, ["collo"]);
  assert.equal(review.phase, "review");
  assert.deepEqual(review.completed, ["collo", "gambe"]);
  assert.equal(JSON.stringify(prepared), before);
  assert.deepEqual(stepPractice(review, "done"), review);
  assert.deepEqual(beginPractice([]), initialPractice());
});

test("Pausing prevents accidental advancement and returning reopens the prior gesture", () => {
  const active = activatePractice(beginPractice(["collo", "braccia"])),
    paused = pausePractice(active);
  assert.equal(paused.paused, true);
  assert.deepEqual(stepPractice(paused, "done"), paused);
  assert.deepEqual(stepPractice(paused, "skip"), paused);
  assert.equal(pausePractice(paused).paused, false);
  const second = stepPractice(pausePractice(paused), "done"),
    previous = previousPractice(second);
  assert.equal(previous.index, 0);
  assert.deepEqual(previous.completed, []);
  assert.equal(previous.paused, false);
  assert.equal(previousPractice(previous).phase, "prepare");
  assert.equal(previousPractice(previousPractice(previous)).phase, "choose");
  const review = stepPractice(stepPractice(active, "done"), "done"),
    reopened = previousPractice(review);
  assert.equal(reopened.phase, "active");
  assert.equal(reopened.index, 1);
  assert.deepEqual(reopened.completed, ["collo"]);
  const complete = { ...review, phase: "complete", entryId: "saved-entry" };
  assert.deepEqual(previousPractice(complete), complete);
  assert.deepEqual(stepPractice(complete, "skip"), complete);
});

test("Direct registration reviews chosen gestures and skipping all preserves an empty result", () => {
  const ids = ["braccia", "respiro"],
    direct = reviewPractice(ids);
  assert.equal(direct.phase, "review");
  assert.deepEqual(direct.completed, ids);
  ids.pop();
  assert.deepEqual(direct.ids, ["braccia", "respiro"]);
  const empty = stepPractice(
    stepPractice(activatePractice(beginPractice(["collo", "braccia"])), "skip"),
    "skip",
  );
  assert.equal(empty.phase, "review");
  assert.deepEqual(empty.completed, []);
  const html = wakeup({ ui: { practices: { wakeup: empty } } });
  assert.match(html, /Hai saltato tutti i gesti/);
  assert.match(html, /data-action="practice-save"[^>]*disabled/);
});

test("Written stages follow elapsed time at each boundary and retain the cue while paused", () => {
  for (const session of meditations) {
    const duration = session.minutes * 60;
    assert.equal(guidedStage(session, {}).index, -1);
    const snapshot = (ratio, running = true) => ({
      duration,
      remaining: duration * (1 - ratio),
      elapsedMs: duration * ratio * 1000,
      running,
      started: true,
    });
    for (const [ratio, expected] of [
      [0, 0],
      [0.39999, 0],
      [0.4, 1],
      [0.79999, 1],
      [0.8, 2],
      [1, 2],
    ]) {
      const current = guidedStage(session, snapshot(ratio));
      assert.equal(current.index, expected, `${session.id} at ${ratio}`);
      assert.equal(current.total, 3);
      assert.deepEqual(guidedStage(session, snapshot(ratio, false)), current);
      assert.equal(current.text, session.stages[expected].text);
    }
    assert.equal(
      guidedStage(session, { duration, remaining: duration + 5, started: true })
        .index,
      0,
    );
    assert.equal(
      guidedStage(session, { duration, remaining: -5, started: true }).index,
      2,
    );
    assert.equal(
      guidedStage(session, { duration, remaining: NaN, started: true }).index,
      0,
    );
  }
});

test("Each written pause places its controls immediately after the instruction and before secondary timing", () => {
  for (const session of meditations) {
    for (const state of [
      { started: false, running: false },
      { started: true, running: true },
      { started: true, running: false },
    ]) {
      const html = guidedSession(
          {
            guidedTimer: {
              ...state,
              duration: session.minutes * 60,
              remaining: session.minutes * 60 - (state.started ? 30 : 0),
            },
          },
          session.id,
        ),
        instruction = html.indexOf('id="guided-stage-text"'),
        controls = html.indexOf('id="guided-toggle"'),
        count = html.indexOf('id="guided-stage-count"'),
        time = html.indexOf('id="guided-time"');
      assert.ok(
        instruction >= 0 &&
          controls > instruction &&
          count > controls &&
          time > count,
        session.id,
      );
      assert.match(
        html,
        /<\/p><\/div><div class="card-actions items-center gap-3"><button id="guided-toggle"/,
      );
      assert.equal((html.match(/id="guided-toggle"/g) || []).length, 1);
    }
  }
});

test("Wakeup review keeps actual minutes empty or preserves the draft and provides focus targets", () => {
  const review = reviewPractice(["collo"]),
    blank = wakeup({ ui: { practices: { wakeup: review } } }),
    draft = wakeup({
      ui: { practices: { wakeup: { ...review, minutes: "12" } } },
    });
  assert.match(blank, /id="practice-minutes"[^>]*required value=""/);
  assert.match(draft, /id="practice-minutes"[^>]*value="12"/);
  assert.match(blank, /id="practice-error"[^>]*role="alert"/);
  assert.match(blank, /id="practice-heading" tabindex="-1"/);
  assert.doesNotMatch(blank, /wake-minutes|value="5"/);
  for (const practice of [
    initialPractice(),
    beginPractice(["collo"]),
    activatePractice(beginPractice(["collo"])),
  ]) {
    const html = wakeup({
      ui: {
        guided: { exerciseIds: ["collo"] },
        practices: { wakeup: practice },
      },
    });
    assert.equal((html.match(/id="practice-heading"/g) || []).length, 1);
    assert.doesNotMatch(html, /id="practice-minutes"/);
  }
});

test("Evening preferences remain separate from the current practice and reminder draft", () => {
  const state = initialState();
  state.sleepRoutine = ["schermi", "luce"];
  state.sleepReminder = { enabled: true, time: "21:30" };
  const before = JSON.stringify(state),
    choose = sleepGuide({ state, ui: { guided: { reminderTime: "22:15" } } });
  assert.match(choose, /Gesti da includere nella mia routine/);
  assert.match(choose, /id="sleep-reminder-time"[^>]*value="22:15"/);
  assert.match(choose, /Promemoria locale attivo · 21:30/);
  for (const practice of [
    beginPractice(state.sleepRoutine),
    activatePractice(beginPractice(state.sleepRoutine)),
    reviewPractice(state.sleepRoutine),
    { ...reviewPractice(state.sleepRoutine), phase: "complete" },
  ]) {
    const html = sleepGuide({
      state,
      ui: { practices: { evening: practice } },
    });
    assert.equal((html.match(/id="practice-heading"/g) || []).length, 1);
    assert.doesNotMatch(html, /practice-minutes|data-action="open-entry"/);
  }
  assert.equal(JSON.stringify(state), before);
});

test("Completion stays visible and distinguishes saved, session-only and blocked records", () => {
  const timer = {
      duration: 600,
      remaining: 600,
      started: false,
      running: false,
    },
    base = {
      entryId: "entry-1",
      date: "2026-10-05",
      minutes: 10,
      points: 15,
      saved: true,
    };
  const saved = guidedSession(
    { guidedTimer: timer, ui: { pauseOutcomes: { pace: base } } },
    "pace",
  );
  assert.match(saved, /Pace Interiore completata/);
  assert.match(
    saved,
    /data-action="open-saved-day" data-date="2026-10-05" data-entry-id="entry-1"/,
  );
  assert.match(saved, /Nuova pausa/);
  assert.doesNotMatch(saved, /Pronta quando vuoi|id="guided-progress"/);
  const temporary = guidedSession(
    {
      guidedTimer: timer,
      ui: { pauseOutcomes: { pace: { ...base, saved: false } } },
    },
    "pace",
  );
  assert.match(temporary, /registrato in questa sessione/);
  assert.match(temporary, /data-action="export-json"/);
  const blocked = guidedSession(
    {
      guidedTimer: timer,
      ui: {
        pauseOutcomes: {
          pace: { ...base, blocked: true, entryId: "", points: 0 },
        },
      },
    },
    "pace",
  );
  assert.match(blocked, /non è stata registrata/);
  assert.match(blocked, /data-action="pause-save" data-id="pace"/);
  assert.doesNotMatch(
    blocked,
    /La tua pausa è nel diario|Registrazione salvata/,
  );
  const breathing = stress({
    timer: { ...timer, duration: 60, remaining: 60 },
    ui: { pauseOutcomes: { stress: { ...base, minutes: 1 } } },
  });
  assert.match(breathing, /pausa di respirazione completata/);
  assert.match(breathing, /Nuova pausa/);
});

test("Hub and catalogue retain a route back to the active or suspended pause", () => {
  const summary = {
    route: "sessione/bosco",
    title: "Bosco Incantato",
    remaining: 333,
    running: false,
  };
  for (const html of [
    mindfulness({ ui: {}, pauseSummary: summary }),
    benessereHub({ pauseSummary: summary }),
  ]) {
    assert.match(html, /Bosco Incantato · in pausa/);
    assert.match(html, /5:33<\/span> rimanenti/);
    assert.match(html, /href="#sessione\/bosco"[^>]*>Riprendi la pausa/);
  }
});

test("Removing a completed record preserves the outcome and earned leaves without linking a missing entry", () => {
  const state = initialState();
  addEntry(state, { type: "mindful", label: "Pace Interiore", minutes: 10 });
  const entry = state.entries[0],
    outcome = {
      entryId: entry.id,
      date: entry.date,
      minutes: 10,
      points: 15,
      saved: true,
    },
    removed = removeRecord(state.entries, entry.id),
    currentOutcome = () => ({
      ...outcome,
      entryMissing: !state.entries.some(
        (record) => record.id === outcome.entryId,
      ),
    });
  const missing = currentOutcome(),
    before = JSON.stringify(missing),
    html = pauseOutcome(missing, "Pace Interiore", "pace");
  assert.match(html, /Pace Interiore completata/);
  assert.match(html, /registrazione è stata rimossa dal diario/);
  assert.match(html, /15 foglie già raccolte restano nel tuo percorso/);
  assert.match(html, /href="#diario"[^>]*>Apri il diario/);
  assert.doesNotMatch(
    html,
    /open-saved-day|data-entry-id=|pause-save|export-json|Registrazione salvata/,
  );
  assert.equal(JSON.stringify(missing), before);
  assert.equal(totalPoints(state), 15);
  const temporaryMissing = pauseOutcome(
    { ...missing, saved: false },
    "Pace Interiore",
    "pace",
  );
  assert.match(temporaryMissing, /registrazione è stata rimossa/);
  assert.doesNotMatch(
    temporaryMissing,
    /salvataggio nel browser non è riuscito|export-json|open-saved-day/,
  );
  assert.equal(restoreRecord(state.entries, removed), true);
  const restored = pauseOutcome(currentOutcome(), "Pace Interiore", "pace");
  assert.match(restored, /data-action="open-saved-day"/);
  assert.doesNotMatch(restored, /registrazione è stata rimossa/);
  assert.equal(totalPoints(state), 15);
});
