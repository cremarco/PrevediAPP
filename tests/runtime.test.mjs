import test from "node:test";
import assert from "node:assert/strict";
import { KEY, initialState, parseState } from "../assets/data.js";
import { createStore } from "../assets/js/store.js";
import { createTimer } from "../assets/js/timer.js";
import { createConversation } from "../assets/js/conversation.js";
import { resolveRoute, createScreenLoader } from "../assets/js/router.js";
import { initialSession } from "../assets/js/session.js";
import { routeNames } from "../assets/js/config.js";
import { diaryCSV } from "../assets/js/export.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
function scheduler() {
  let nextId = 0;
  const jobs = new Map();
  return {
    jobs,
    schedule(callback, delay) {
      const id = ++nextId;
      jobs.set(id, { callback, delay });
      return id;
    },
    cancel(id) {
      jobs.delete(id);
    },
    run() {
      const [id, job] = jobs.entries().next().value;
      jobs.delete(id);
      return job.callback();
    },
  };
}

test("Storage preserves the v1 key and round-trips existing personal records", () => {
  const storage = memoryStorage();
  const store = createStore(() => storage);
  store.state.name = "Prova";
  store.state.fridge = ["tofu"];
  assert.equal(store.save(), true);
  assert.equal(JSON.parse(storage.getItem(KEY)).version, 1);
  assert.equal(createStore(() => storage).state.name, "Prova");
  assert.deepEqual(createStore(() => storage).state.fridge, ["tofu"]);
});
test("Unavailable storage keeps in-memory edits and clears its warning after recovery", () => {
  const storage = memoryStorage();
  let blocked = true;
  const store = createStore(() => {
    if (blocked) throw new Error("blocked");
    return storage;
  });
  assert.ok(store.problem);
  store.state.name = "In memoria";
  assert.equal(store.save(), false);
  assert.equal(store.state.name, "In memoria");
  blocked = false;
  assert.equal(store.save(), true);
  assert.equal(store.problem, "");
});
test("Malformed external saves preserve the current state; valid saves and clears synchronize", () => {
  const store = createStore(memoryStorage);
  store.state.name = "Da conservare";
  assert.equal(store.sync("{broken"), false);
  assert.equal(store.state.name, "Da conservare");
  assert.ok(store.problem);
  assert.equal(
    store.sync(JSON.stringify({ ...initialState(), name: "Altra scheda" })),
    true,
  );
  assert.equal(store.problem, "");
  assert.equal(store.state.name, "Altra scheda");
  assert.equal(store.sync(null), true);
  assert.equal(store.state.name, "");
});
test("Malformed optional saved records cannot crash chat or inflate duplicate reward costs", () => {
  const value = {
    ...initialState(),
    chat: [
      null,
      { role: "user", text: "Valido" },
      { role: "assistant", text: 5 },
    ],
    claimed: ["nest", "nest", {}, "unknown"],
    fridge: ["tofu", null, "unknown"],
    decoration: "unknown",
  };
  const state = parseState(JSON.stringify(value));
  assert.deepEqual(state.chat, [{ role: "user", text: "Valido" }]);
  assert.deepEqual(state.claimed, ["nest"]);
  assert.deepEqual(state.fridge, ["tofu"]);
  assert.equal(state.decoration, "none");
});
test("Timer has no scheduled work while idle or after reset", () => {
  const clock = scheduler();
  const timer = createTimer({ schedule: clock.schedule, cancel: clock.cancel });
  assert.equal(clock.jobs.size, 0);
  timer.setDuration(180);
  assert.equal(timer.snapshot().remaining, 180);
  timer.setDuration(999);
  assert.equal(timer.snapshot().duration, 180);
  timer.toggle();
  assert.equal(clock.jobs.size, 1);
  timer.reset();
  assert.equal(clock.jobs.size, 0);
  assert.equal(timer.snapshot().started, false);
});
test("Timer updates once per second and resumes from the real remaining time", () => {
  const clock = scheduler();
  let now = 0;
  const ticks = [];
  const timer = createTimer({
    now: () => now,
    schedule: clock.schedule,
    cancel: clock.cancel,
    onTick: (t) => ticks.push(t.remaining),
  });
  timer.toggle();
  assert.equal([...clock.jobs.values()][0].delay, 1000);
  now = 1000;
  clock.run();
  assert.deepEqual(ticks, [60, 59]);
  now = 1250;
  timer.toggle();
  assert.equal(timer.snapshot().remaining, 59);
  assert.equal(clock.jobs.size, 0);
  now = 10000;
  timer.toggle();
  now = 11000;
  clock.run();
  assert.equal(timer.snapshot().remaining, 58);
});
test("A suspended timer completes once on its next tick, without accumulating interval drift", () => {
  const clock = scheduler();
  let now = 0,
    completions = 0;
  const timer = createTimer({
    now: () => now,
    schedule: clock.schedule,
    cancel: clock.cancel,
    onComplete: () => completions++,
  });
  timer.toggle();
  now = 65000;
  clock.run();
  assert.equal(completions, 1);
  assert.equal(clock.jobs.size, 0);
  assert.equal(timer.snapshot().running, false);
});
test("Reset invalidates a timer callback that was already queued", () => {
  const clock = scheduler();
  let now = 0,
    completions = 0;
  const timer = createTimer({
    now: () => now,
    schedule: clock.schedule,
    cancel: clock.cancel,
    onComplete: () => completions++,
  });
  timer.toggle();
  const oldJob = [...clock.jobs.values()][0];
  timer.reset();
  now = 65000;
  oldJob.callback();
  assert.equal(completions, 0);
});
test("Conversation trims input, prevents overlapping sends and bounds history", async () => {
  const clock = scheduler(),
    store = createStore(memoryStorage);
  const conversation = createConversation({
    store,
    schedule: clock.schedule,
    cancel: clock.cancel,
    respond: (text) => "Risposta a " + text,
  });
  assert.equal(conversation.send("   "), false);
  assert.equal(conversation.send("  ciao  "), true);
  assert.equal(conversation.send("secondo"), false);
  assert.equal(store.state.chat[0].text, "ciao");
  await clock.run();
  assert.equal(conversation.busy, false);
  assert.equal(store.state.chat[1].text, "Risposta a ciao");
  store.state.chat = Array.from({ length: 40 }, () => ({
    role: "user",
    text: "precedente",
  }));
  conversation.send("x".repeat(600));
  await clock.run();
  assert.equal(store.state.chat.length, 40);
  assert.equal(store.state.chat.at(-2).text.length, 500);
});
test("Clearing a chat cancels a pending reply and preserves a newer request", async () => {
  const clock = scheduler(),
    store = createStore(memoryStorage);
  const conversation = createConversation({
    store,
    schedule: clock.schedule,
    cancel: clock.cancel,
    respond: (text) => "Risposta " + text,
  });
  conversation.send("vecchio");
  const oldJob = [...clock.jobs.values()][0];
  conversation.clear();
  conversation.send("nuovo");
  await oldJob.callback();
  assert.equal(clock.jobs.size, 1);
  await clock.run();
  assert.deepEqual(
    store.state.chat.map((m) => m.text),
    ["nuovo", "Risposta nuovo"],
  );
});
test("Clearing during an async reply cannot resurrect messages after resolution", async () => {
  const clock = scheduler(),
    store = createStore(memoryStorage);
  let resolve;
  const response = new Promise((done) => {
    resolve = done;
  });
  const conversation = createConversation({
    store,
    schedule: clock.schedule,
    cancel: clock.cancel,
    respond: () => response,
  });
  conversation.send("ciao");
  const pending = clock.run();
  conversation.clear();
  resolve("Risposta tardiva");
  await pending;
  assert.deepEqual(store.state.chat, []);
  assert.equal(conversation.busy, false);
});
test("Resetting the store after canceling a conversation cannot append an old reply", async () => {
  const clock = scheduler(),
    store = createStore(memoryStorage);
  const conversation = createConversation({
    store,
    schedule: clock.schedule,
    cancel: clock.cancel,
    respond: () => "vecchia risposta",
  });
  conversation.send("vecchio");
  const oldJob = [...clock.jobs.values()][0];
  conversation.cancelPending();
  store.reset();
  await oldJob.callback();
  assert.deepEqual(store.state.chat, []);
});
test("A failed reply releases the composer and reports a recoverable failure", async () => {
  const clock = scheduler(),
    store = createStore(memoryStorage),
    changes = [],
    errors = [];
  const conversation = createConversation({
    store,
    schedule: clock.schedule,
    cancel: clock.cancel,
    respond: () => {
      throw new Error("failed");
    },
    onChange: (c) => changes.push(c),
    onError: (e) => errors.push(e),
  });
  conversation.send("ciao");
  await clock.run();
  assert.equal(conversation.busy, false);
  assert.equal(errors.length, 1);
  assert.deepEqual(changes, ["sent", "failed"]);
});
test("Route resolution rejects inherited names and invalid quiz categories", () => {
  for (const hash of ["#__proto__", "#constructor", "#toString", "#unknown"])
    assert.equal(resolveRoute(hash).view, "percorso");
  assert.deepEqual(resolveRoute("#quiz/sonno"), {
    view: "quiz",
    category: "sonno",
    skipToMain: false,
  });
  assert.equal(resolveRoute("#quiz/__proto__").category, "alimentazione");
  assert.equal(resolveRoute("#main").skipToMain, true);
});
test("Screen loaders cache success but retry a failed route import", async () => {
  let attempts = 0;
  const render = () => "<h1>Loaded</h1>";
  const load = createScreenLoader({
    percorso: () =>
      ++attempts === 1
        ? Promise.reject(new Error("offline"))
        : Promise.resolve(render),
  });
  await assert.rejects(load("percorso"));
  assert.equal(await load("percorso"), render);
  assert.equal(await load("percorso"), render);
  assert.equal(attempts, 2);
});
test("Every registered screen loads and renders without accessing the DOM", async () => {
  const load = createScreenLoader();
  const context = {
    state: initialState(),
    ui: initialSession(),
    timer: {
      duration: 60,
      remaining: 60,
      running: false,
      started: false,
      end: 0,
    },
    chatBusy: false,
  };
  for (const route of Object.keys(routeNames)) {
    const screen = await load(route);
    const html = screen(context);
    assert.match(html, /<h1>/, route);
    assert.doesNotMatch(html, /\bundefined\b|\bNaN\b/, route);
  }
});
test("CSV exports retain accented text, quotes, separators and formula protection", () => {
  const csv = diaryCSV([
    {
      date: "2026-10-05",
      type: "meal",
      label: "=1+1",
      meal: 'Pranzo; "caffè"',
    },
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=1+1"'));
  assert.ok(csv.includes('"Pranzo; ""caffè"""'));
  assert.equal(csv.split("\r\n").length, 2);
});

test("A canceled timer tick cannot join a newly started session", () => {
  const clock = scheduler();
  let now = 0;
  const timer = createTimer({
    now: () => now,
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  timer.toggle();
  const oldJob = [...clock.jobs.values()][0];
  timer.reset();
  timer.toggle();
  now = 1000;
  oldJob.callback();
  assert.equal(clock.jobs.size, 1);
  assert.equal(timer.snapshot().remaining, 60);
  clock.run();
  assert.equal(timer.snapshot().remaining, 59);
});
