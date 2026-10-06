import test from "node:test";
import assert from "node:assert/strict";
import { createTimer } from "../assets/js/timer.js";
import {
  breathingState,
  createBreathingMotion,
} from "../assets/js/breathing.js";
import { stress } from "../assets/js/views/wellness.js";

function timerClock(options = {}) {
  let now = 0,
    nextId = 0;
  const jobs = new Map();
  const timer = createTimer({
    now: () => now,
    schedule(callback, delay) {
      const id = ++nextId;
      jobs.set(id, { callback, delay });
      return id;
    },
    cancel: (id) => jobs.delete(id),
    ...options,
  });
  return {
    timer,
    jobs,
    at(value) {
      now = value;
    },
    run() {
      const [id, job] = jobs.entries().next().value;
      jobs.delete(id);
      job.callback();
    },
    next: () => jobs.values().next().value,
  };
}

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
    emit(name) {
      for (const callback of listeners.get(name) ?? []) callback();
    },
  };
}

function element() {
  const attributes = new Map(),
    properties = new Map();
  return {
    textContent: "",
    hidden: false,
    checked: false,
    disabled: false,
    style: {
      setProperty: (name, value) => properties.set(name, value),
      getPropertyValue: (name) => properties.get(name),
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
  };
}

function motionHarness() {
  const animations = [],
    observers = [];
  const nodes = new Map(
    [
      "#breathing-phase",
      "#breathing-cue",
      "#breathing-phase-step",
      "#breathing-step-1",
      "#breathing-step-2",
      "#breathing-step-3",
      "#breathing-step-4",
      "#breathing-progress",
      "#breathing-progress-text",
      "#breathing-motion",
      "#breathing-motion-note",
    ].map((selector) => [selector, element()]),
  );
  const document = {
    ...eventTarget(),
    hidden: false,
    querySelector: (selector) => nodes.get(selector) ?? null,
  };
  const mediaQuery = { ...eventTarget(), matches: false };
  let snapshot = {
    duration: 60,
    remaining: 60,
    elapsedMs: 0,
    running: true,
    started: true,
  };
  function replaceCore() {
    const core = element();
    core.animate = () => {
      const animation = {
        currentTime: 0,
        state: "running",
        play() {
          this.state = "running";
        },
        pause() {
          this.state = "paused";
        },
        cancel() {
          this.state = "canceled";
        },
      };
      animations.push(animation);
      return animation;
    };
    nodes.set("[data-breathing-core]", core);
    return core;
  }
  replaceCore();
  const motion = createBreathingMotion({
    document,
    mediaQuery,
    getSnapshot: () => snapshot,
    observe(callback) {
      const observer = {
        observed: null,
        disconnected: false,
        observe(core) {
          this.observed = core;
        },
        disconnect() {
          this.disconnected = true;
        },
        emit(visible) {
          callback([{ target: this.observed, isIntersecting: visible }]);
        },
      };
      observers.push(observer);
      return observer;
    },
  });
  return {
    motion,
    document,
    mediaQuery,
    nodes,
    animations,
    observers,
    replaceCore,
    setSnapshot(changes) {
      snapshot = { ...snapshot, ...changes };
    },
    latestAnimation: () => animations.at(-1),
  };
}

test("Fractional pauses preserve the breathing position and second boundary", () => {
  const clock = timerClock();
  clock.timer.toggle();
  clock.at(1000);
  clock.run();
  clock.at(1250);
  clock.timer.toggle();
  assert.equal(clock.timer.snapshot().elapsedMs, 1250);
  assert.equal(clock.timer.snapshot().remaining, 59);
  assert.equal(clock.jobs.size, 0);
  clock.at(10000);
  assert.equal(clock.timer.snapshot().elapsedMs, 1250);
  clock.timer.toggle();
  assert.equal(clock.timer.snapshot().elapsedMs, 1250);
  assert.equal(clock.next().delay, 750);
  clock.at(10750);
  clock.run();
  assert.equal(clock.timer.snapshot().elapsedMs, 2000);
  assert.equal(clock.timer.snapshot().remaining, 58);
});

test("Breathing instructions change at the exact inhalation and cycle boundaries", () => {
  for (const [elapsedMs, phase, seconds] of [
    [3999, "Inspira", 1],
    [4000, "Espira", 4],
    [7999, "Espira", 1],
    [8000, "Inspira", 4],
  ]) {
    const state = breathingState({
      duration: 60,
      remaining: 60,
      running: true,
      started: true,
      elapsedMs,
    });
    assert.equal(state.phase, phase, `${elapsedMs} ms`);
    assert.ok(state.cue.endsWith(`· ${seconds} s`), `${elapsedMs} ms`);
  }
});

test("The four breath beats restart for each half-cycle and preserve a fractional pause", () => {
  for (const [elapsedMs, phaseStep] of [
    [0, 1],
    [999, 1],
    [1000, 2],
    [3999, 4],
    [4000, 1],
    [7999, 4],
    [8000, 1],
  ]) {
    assert.equal(
      breathingState({ duration: 60, elapsedMs, started: true, running: true })
        .phaseStep,
      phaseStep,
      `${elapsedMs} ms`,
    );
  }
  assert.equal(
    breathingState({
      duration: 60,
      elapsedMs: 0,
      started: false,
      running: false,
    }).phaseStep,
    0,
  );
  const paused = breathingState({
    duration: 180,
    elapsedMs: 5250,
    started: true,
    running: false,
  });
  assert.equal(paused.phaseStep, 2);
  assert.equal(paused.phase, "In pausa");
  assert.equal(paused.progress, 2.9);
});

test("Snapshots seek between ticks and remain read-only after the deadline", () => {
  const completions = [];
  const clock = timerClock({ onComplete: (value) => completions.push(value) });
  clock.timer.toggle();
  clock.at(4250);
  const snapshot = clock.timer.snapshot();
  assert.equal(snapshot.elapsedMs, 4250);
  assert.equal(breathingState(snapshot).phase, "Espira");
  assert.equal(breathingState(snapshot).remaining, 56);
  clock.at(65000);
  assert.equal(clock.timer.snapshot().elapsedMs, 60000);
  assert.equal(clock.timer.snapshot().running, true);
  assert.equal(completions.length, 0);
  assert.equal(clock.jobs.size, 1);
  clock.run();
  assert.equal(completions.length, 1);
  assert.equal(clock.timer.snapshot().elapsedMs, 0);
  assert.equal(clock.jobs.size, 0);
});

test("Pausing an expired timer completes once and stale ticks cannot enter a new session", () => {
  const completions = [];
  const clock = timerClock({ onComplete: (value) => completions.push(value) });
  clock.timer.toggle();
  const staleTick = clock.next().callback;
  clock.at(60001);
  clock.timer.toggle();
  assert.equal(completions.length, 1);
  assert.equal(completions[0].duration, 60);
  assert.equal(clock.timer.snapshot().started, false);
  assert.equal(clock.jobs.size, 0);
  staleTick();
  assert.equal(completions.length, 1);
  clock.timer.toggle();
  clock.at(61001);
  staleTick();
  assert.equal(clock.jobs.size, 1);
  assert.equal(clock.timer.snapshot().remaining, 60);
  clock.run();
  assert.equal(clock.timer.snapshot().remaining, 59);
  assert.equal(completions.length, 1);
});

test("Motion pauses at the timer position and resumes without losing its phase", () => {
  const h = motionHarness();
  h.setSnapshot({ elapsedMs: 4250 });
  h.motion.mount();
  const animation = h.latestAnimation();
  assert.equal(animation.currentTime, 4250);
  assert.equal(animation.state, "running");
  assert.equal(h.nodes.get("#breathing-phase").textContent, "Espira");
  h.setSnapshot({ elapsedMs: 4500, running: false });
  h.motion.update();
  assert.equal(animation.currentTime, 4500);
  assert.equal(animation.state, "paused");
  assert.equal(h.nodes.get("#breathing-phase").textContent, "In pausa");
  h.setSnapshot({ running: true });
  h.motion.update();
  assert.equal(h.latestAnimation(), animation);
  assert.equal(animation.currentTime, 4500);
  assert.equal(animation.state, "running");
  h.setSnapshot({ elapsedMs: 8250 });
  h.motion.update();
  assert.equal(animation.currentTime, 250);
  assert.equal(h.nodes.get("#breathing-phase").textContent, "Inspira");
});

test("The accessible beat markers follow the timer even with motion switched off", () => {
  const h = motionHarness();
  h.motion.setEnabled(false);
  h.setSnapshot({ elapsedMs: 3999 });
  h.motion.mount();
  assert.equal(h.animations.length, 0);
  assert.equal(
    h.nodes.get("#breathing-step-4").getAttribute("aria-current"),
    "step",
  );
  assert.equal(
    h.nodes.get("#breathing-phase-step").textContent,
    "Tempo 4 di 4",
  );
  h.setSnapshot({ elapsedMs: 4000 });
  h.motion.update();
  assert.equal(
    h.nodes.get("#breathing-step-4").getAttribute("aria-current"),
    null,
  );
  assert.equal(
    h.nodes.get("#breathing-step-4").getAttribute("class"),
    "step min-w-0",
  );
  assert.equal(
    h.nodes.get("#breathing-step-1").getAttribute("aria-current"),
    "step",
  );
  assert.equal(h.nodes.get("#breathing-phase").textContent, "Espira");
  assert.equal(h.nodes.get("#breathing-progress-text").textContent, "6.7%");
  h.setSnapshot({ elapsedMs: 5250, running: false });
  h.motion.update();
  assert.equal(
    h.nodes.get("#breathing-step-2").getAttribute("aria-current"),
    "step",
  );
  assert.equal(
    h.nodes.get("#breathing-phase-step").textContent,
    "Tempo 2 di 4 · in pausa",
  );
  h.setSnapshot({ elapsedMs: 0, started: false });
  h.motion.update();
  assert.equal(
    h.nodes.get("#breathing-phase-step").textContent,
    "Quattro tempi per ogni fase",
  );
  for (let step = 1; step <= 4; step++)
    assert.equal(
      h.nodes.get(`#breathing-step-${step}`).getAttribute("aria-current"),
      null,
    );
});

test("The breathing widget separates session progress from a quiet four-beat guide", () => {
  const html = stress({
    timer: {
      duration: 60,
      elapsedMs: 2500,
      remaining: 58,
      running: true,
      started: true,
    },
    breathing: { enabled: false, reduced: true },
  });
  assert.match(
    html,
    /Avanzamento della pausa <span[^>]+id="breathing-progress-text"/,
  );
  assert.match(html, /aria-label="Avanzamento della pausa"/);
  assert.match(html, /id="breathing-phase"[^>]+aria-live="polite"/);
  assert.match(html, /id="timer-time"[^>]+aria-live="off"/);
  assert.match(html, /id="breathing-step-3"[^>]+aria-current="step"/);
  assert.equal((html.match(/data-breathing-step="/g) ?? []).length, 4);
  assert.equal((html.match(/aria-live="polite"/g) ?? []).length, 1);
  assert.match(html, /4 s inspira · 4 s espira/);
  assert.match(html, /Tempo 3 di 4/);
  assert.match(html, /Movimento ridotto attivo sul dispositivo/);
});

test("Reduced motion and the motion switch cancel movement while preserving instructions", () => {
  const h = motionHarness();
  h.motion.mount();
  const toggle = h.nodes.get("#breathing-motion");
  assert.equal(toggle.getAttribute("aria-describedby"), null);
  h.motion.setEnabled(false);
  assert.equal(h.latestAnimation().state, "canceled");
  assert.equal(toggle.checked, false);
  h.mediaQuery.matches = true;
  h.setSnapshot({ elapsedMs: 4000 });
  h.mediaQuery.emit("change");
  assert.equal(toggle.disabled, true);
  assert.equal(
    toggle.getAttribute("aria-describedby"),
    "breathing-motion-note",
  );
  assert.equal(h.nodes.get("#breathing-motion-note").hidden, false);
  assert.equal(h.nodes.get("#breathing-phase").textContent, "Espira");
  assert.ok(h.nodes.get("#breathing-cue").textContent.endsWith("· 4 s"));
  h.motion.setEnabled(true);
  assert.equal(h.animations.length, 1);
  assert.equal(toggle.checked, false);
  h.mediaQuery.matches = false;
  h.mediaQuery.emit("change");
  assert.equal(toggle.disabled, false);
  assert.equal(toggle.checked, true);
  assert.equal(toggle.getAttribute("aria-describedby"), null);
  assert.equal(h.nodes.get("#breathing-motion-note").hidden, true);
  assert.equal(h.latestAnimation().currentTime, 4000);
  assert.equal(h.latestAnimation().state, "running");
});

test("Hidden and offscreen motion resumes from elapsed timer time", () => {
  const h = motionHarness();
  h.motion.mount();
  const animation = h.latestAnimation();
  h.document.hidden = true;
  h.document.emit("visibilitychange");
  assert.equal(animation.state, "paused");
  h.setSnapshot({ elapsedMs: 12500 });
  h.document.hidden = false;
  h.document.emit("visibilitychange");
  assert.equal(animation.currentTime, 4500);
  assert.equal(animation.state, "running");
  h.observers[0].emit(false);
  assert.equal(animation.state, "paused");
  h.setSnapshot({ elapsedMs: 16250 });
  h.observers[0].emit(true);
  assert.equal(animation.currentTime, 250);
  assert.equal(animation.state, "running");
});

test("Remount and cleanup cancel old motion and ignore disconnected observer callbacks", () => {
  const h = motionHarness();
  h.motion.mount();
  const firstAnimation = h.latestAnimation(),
    firstObserver = h.observers[0];
  const newCore = h.replaceCore();
  h.setSnapshot({ elapsedMs: 5000 });
  h.motion.mount();
  const secondAnimation = h.latestAnimation();
  assert.equal(firstAnimation.state, "canceled");
  assert.equal(firstObserver.disconnected, true);
  assert.equal(h.observers[1].observed, newCore);
  assert.equal(secondAnimation.currentTime, 5000);
  assert.equal(secondAnimation.state, "running");
  firstObserver.emit(false);
  assert.equal(secondAnimation.state, "running");
  h.motion.clear();
  assert.equal(secondAnimation.state, "canceled");
  assert.equal(h.observers[1].disconnected, true);
  h.observers[1].emit(true);
  h.document.emit("visibilitychange");
  h.mediaQuery.emit("change");
  assert.equal(h.animations.length, 2);
});
